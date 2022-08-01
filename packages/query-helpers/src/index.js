'use strict';

const util = require('util');
const debug = require('debug')('query-helpers:debug');
const fp = require('lodash/fp');
const { capitalCase } = require('change-case');

let max_values = 256;

module.exports = {
    run_group_by_count,
    run_group_by,
    run_filters,
    max_values
}

const selected_types = ['string', 'boolean', 'enumeration', 'integer', 'biginteger', 'decimal', 'float'];

async function run_group_by_count(uid, groupBy, {filters, publicationState}) {

    const meta = strapi.db.metadata.get(uid);

    filters = update_filters(meta, filters, publicationState);

    groupBy = get_group_by_array(meta, groupBy);

    const query = strapi.db.entityManager.createQueryBuilder(uid).init({filters, groupBy}).count();

    const result = await query.execute();

    if (result) return result.length;

    return null;
}

async function run_group_by(uid, groupBy, {filters, fields, populate, publicationState, limit, sort: orderBy, start: offset}) {

    const meta = strapi.db.metadata.get(uid);

    filters = update_filters(meta, filters, publicationState);

    const [ gb_sql, bindings ] = get_gb_sql(meta, filters, groupBy, orderBy);

    let sql = get_full_sql(uid, fields, populate, orderBy, offset, limit, gb_sql, bindings);
    
    if (is_postgres()) sql = sql.replace(/`/g, '"');

    debug('run_group_by', util.inspect({sql, bindings},  {breakLength: Infinity, depth: null, colors: true}));

    const result = await strapi.db.connection.context.raw(sql, bindings)

    const raw_rows = get_data(result, true);

    const items = [];
    for (const row of raw_rows) {
        const item = {};
        for (const [column_name, value] of Object.entries(row)) {
            const key = meta.columnToAttribute[column_name]
            if (!key) continue;
            item[key] = value;
        }
        items.push(item);
    }

    return items;
}

async function run_filters(uid, filters_config, params) {

    filters_config = get_filters_config(uid, params.fields, filters_config);

    if (filters_config.length === 0) {
        return [];
    }

    const queries = build_queries(uid, filters_config, params);

    const result = {};
    const promises = [];
    for (const { key, sql, bindings } of queries) {
        debug('run_filters', util.inspect({ key, sql, bindings },  {breakLength: Infinity, depth: null, colors: true}));
        promises.push(run_filters_sql(result, key, sql, bindings));
    }

    await Promise.all(promises);

    return normalize(result, filters_config);
}

async function run_filters_sql(result, key, sql, bindings) {
    const raw_result = await strapi.db.connection.context.raw(sql, bindings);
    if (key === 'ranges') {
        result[key] = get_data(raw_result, false);
    } else {
        result[key] = get_data(raw_result, true);
    }
}

function get_gb_sql(meta, filters, groupBy, orderBy) {

    const qb = strapi.db.entityManager.createQueryBuilder(meta.uid);

    const group_by_array = get_group_by_array(meta, groupBy);
    
    let partition_by = '';
    for (const group_by of group_by_array) {
        if (partition_by.length > 0) partition_by += ', ';
        partition_by += group_by;
    }

    const to = qb.init({select: ['id'], filters, orderBy});

    const result = to.getKnexQuery().toSQL();
    const parts = result.sql.split(' from ');

    let order_by = '';
    if (orderBy) {
        const pparts = parts[1].split(' order by ');
        order_by = ' order by ' + pparts[1];
        parts[1] = pparts[0];
    }

    const sql = 'with added_row_no as (' + parts[0] + 
        ', row_number() over ( partition by ' + partition_by + order_by +
        ' ) as row_no from ' + parts[1] + ' ) select id from added_row_no where row_no = 1'; 

    return [ sql, result.bindings ];
}

function get_full_sql(uid, fields, populate, orderBy, offset, limit, gb_sql, bindings) {
    
    const qb = strapi.db.entityManager.createQueryBuilder(uid);
    const to = qb.init({select: fields, filters: {id: {$in: '*'}}, populate, orderBy, offset, limit});
    const result = to.getKnexQuery().toSQL();

    const sql = result.sql.replace(/`t0`/g, '`t1`').replace('in (?)', `in ( ${gb_sql} )`);

    result.bindings.shift();
    bindings.push(...result.bindings);

    return sql;
}

function get_filters_config(uid, fields, filters_config) {

    const meta = strapi.db.metadata.get(uid);

    if (filters_config) {
        const filters_config_clone = fp.cloneDeep(filters_config);
        filters_config = [];
        for (const filter of filters_config_clone) {
            if (!filter.key) continue;
            const attribute = meta.attributes[filter.key];
            if (!attribute) continue;
            if (!filter.type) {
                const filter_type = get_filter_type(filter.key, attribute.type);
                if (!filter_type) continue;
                filter.type = filter_type;
            }
            filters_config.push(filter);
        }
    } else {
        filters_config = [];
        for (const [ key, { type } ] of Object.entries(meta.attributes)) {
            if (fields && !fields.includes(key)) continue;
            const filter_type = get_filter_type(key, type);
            if (!filter_type) continue;
            filters_config.push({key, type: filter_type});
        }
    }

    debug('get_filters_config', util.inspect(filters_config,  {breakLength: Infinity, depth: null, colors: true}));

    return filters_config;
}

function get_filter_type(key, type) {
    if (key === 'id' || !selected_types.includes(type)) return null;
    if (['string', 'boolean', 'enumeration'].includes(type)) {
        return 'list';
    } else {
        return 'range';
    }
}

function normalize(result, filters_config) {

    const ranges = result.ranges;

    const total = Number(ranges.total);

    const list = [];

    for (const {key, type, values_config, ...rest} of filters_config) {

        const entry = {key, type, ...rest};

        if (!entry.title) entry.title = get_title_label(key);

        if (type === 'range') {

            const count = Number(ranges[`count_${key}`]);
            if (isNaN(count) || count === 0) continue;

            const min = ranges[`min_${key}`];
            if (isNaN(min)) continue;

            const max = ranges[`max_${key}`];
            if (isNaN(max)) continue;

            if (values_config && values_config.min) {
                entry.min = { ...values_config.min };
                entry.min.value = min;
            } else {
                entry.min = min;
            }

            if (values_config && values_config.max) {
                entry.max = { ...values_config.max };
                entry.max.value = max;
            } else {
                entry.max = max;
            }

            entry.count = count;
            entry.full_set = (count === total);

        } else if (type === 'list') {
            
            if (!result[key]) continue;

            if (result[key].length === 0 || result[key].length > max_values) continue;

            if (values_config) {

                let sum = 0;
                const items = [];
                for (const value_prop of values_config) {
                    const item = result[key].find(x => x.value === value_prop.value);
                    if (!item) continue;
                    if (!item.label) item.label = get_title_label(value_prop.value);
                    const count = Number(item.count)
                    sum += count;
                    items.push({...value_prop, count});
                }
                entry.items = items;

                entry.full_set = (sum === total);

            } else {

                entry.items = result[key];

                let sum = 0;
                for (const item of entry.items) {
                    item.label = get_title_label(item.value);
                    item.count = Number(item.count);
                    sum += item.count;
                }
                entry.full_set = (sum === total);
            }

        }

        list.push(entry);
    }

    return list;
};

function get_title_label(value) {
    if (!value) return '';
    if (value.toUpperCase() === value) return value;
    else return capitalCase(value);
}

function get_sql_template(uid, filters, publicationState) {

    const meta = strapi.db.metadata.get(uid);

    filters = update_filters(meta, filters, publicationState);

    const qb = strapi.db.entityManager.createQueryBuilder(uid);
    const { sql, bindings } = qb.init(
        {filters, select: ['tmp_select'], groupBy: ['tmp_group_by']}
    ).getKnexQuery().toSQL();

    const sql_template = is_postgres() ?
        sql.replace('"t0"."tmp_select"', '{{select}}').replace(' group by "tmp_group_by"', '{{groupBy}}') :
        sql.replace('`t0`.`tmp_select`', '{{select}}').replace(' group by `tmp_group_by`', '{{groupBy}}'); 

    return { sql_template, bindings };
}

function build_queries(uid, filters_config, params) {

    const { sql_template, bindings } = get_sql_template(uid, params.filters, params.publicationState);

    const queries = []; 

    let ranges_select = 'count(*) as total';

    const attributes = strapi.db.metadata.get(uid).attributes;

    for (const {key, type} of filters_config) {
        
        if (!key || !type) continue;

        const column_name = attributes[key].columnName;

        if (type === 'list') {
            const select = `\`t0\`.\`${column_name}\` as \`value\`, count(\`${column_name}\`) as \`count\``;
            const groupBy = ` group by \`${column_name}\``;
            let sql = sql_template.replace('{{select}}', select);
            sql = sql.replace('{{groupBy}}', groupBy);
            if (is_postgres()) sql = sql.replace(/`/g, '"');
            queries.push({key, sql, bindings});
            continue;
        }

        if (type === 'range') {
            ranges_select += `, max(\`${column_name}\`) as \`max_${key}\`, min(\`${column_name}\`) as \`min_${key}\`, count(\`${column_name}\`) as \`count_${key}\``;
            continue;
        }

        console.error(`build_queries, ${key} has an unknown type ${type}`);
    }

    let sql = sql_template.replace('{{groupBy}}', '');
    sql = sql.replace('{{select}}', ranges_select);

    if (is_postgres()) sql = sql.replace(/`/g, '"');

    queries.push({ key: 'ranges', sql, bindings});

    return queries;
}

function get_group_by_array(meta, groupBy) {

    if (!Array.isArray(groupBy)) groupBy = [ groupBy ];

    const items = [];
    for (const key of groupBy) {
        const attribute = meta.attributes[key];
        if (!attribute) items.push(key);
        else items.push(attribute.columnName);
    }

    return items;
}

function update_filters(meta, filters, publicationState) {

    if (!filters) filters = {};

    if (!publicationState || publicationState === 'live') {
        if (meta.attributes.publishedAt) {
            filters.publishedAt = {$notNull: true};
        }
    }

    return filters;
}

function get_data(result, array = false) {

    if (is_postgres()) {

        if (array) {
            return result.rows;
        } else {
            return result.rows[0];
        }

    } else {

        if (Array.isArray(result)) {
            if (Array.isArray(result[0])) {
                return get_data(result[0], array);
            } else {
                if (array) return result;
                else return result[0]
            }
        } else {
            return result;
        }
    }
}

let postgres = null;

function is_postgres() {
    if (postgres === null) {
        postgres = strapi.db.dialect.client === 'postgres';
    }
    return postgres;
}