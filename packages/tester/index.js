'use strict';

const opts = require('./lib/get-options');

const qs = require('qs');
const get_request = require('./lib/get-request');
const parallel_gets = require('./lib/parallel-gets');
const sequential_gets = require('./lib/sequential-gets');
const get_stats = require('./lib/get-stats');

(async () => {
    if (opts.walk_through) {
        await run_walk_through();
    } else {
        await run_single_path();
    }
    const { result } = get_stats();
    if (result.not_ok_count > 0) process.exit(1);
})();

async function run_single_path() {
    if (opts.concurrent) {
        await parallel_gets(opts.path, opts.times);
    } else {
        await sequential_gets(opts.path, opts.times);
    }
}

async function run_walk_through() {
    const {path, query} = get_walk_through_path_query();
    const result = await get_request(path + '?' + get_page_query(query, 1));
    let page_count = 0;
    if (result.pagination) {
        page_count = result.pagination.pageCount;
    } else if (Array.isArray(result)) {
        const count_path = `${path}/count`;
        const count = await get_request(count_path);
        if (count && count > 0) {
            const page_size = result.length;
            page_count = Math.ceil(count / page_size);
            if (!query.pagination) query.pagination = {pageSize: page_size};
            else query.pagination.pageSize = page_size; 
        }
    }
    if (page_count > 1) {
        const paths = [];
        for (let page = 2; page <= page_count; page++) {
            paths.push(path + '?' + get_page_query(query, page));
        }
        if (opts.concurrent) {
            await parallel_gets(paths, opts.times);
        } else {
            await sequential_gets(paths, opts.times);
        }
    }
}

function get_walk_through_path_query() {
    const parts1 = opts.path.split('?');
    const parts2 = parts1[0].split('/');
    const last = parts2[parts2.length - 1];
    if (last === 'count' || !isNaN(last)) parts2.pop();
    const query = parts1.length === 2 ? qs.parse(parts1[1]) : {}
    const path = parts2.join('/');
    return {path, query};
}

function get_page_query(query, page) {
    const q = {...query};
    if (!q.pagination) q.pagination = { page };
    else q.pagination.page = page;
    return qs.stringify(q);
}