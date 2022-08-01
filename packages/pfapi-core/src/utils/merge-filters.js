'use strict';

const _ = require('lodash');

module.exports = (filters, config_filters) => {

    filters = get_array(filters);
    config_filters = get_array(config_filters);

    if (!filters && !config_filters) return undefined;
    if (!filters) return get_object(config_filters);
    if (!config_filters) return get_object(filters);

    for (const filter of config_filters) {
        if (filters.find(x => _.isEqual(x, filter))) continue;
        filters.push(filter);
    }

    return get_object(filters);
}

function get_object(array) {
    if (!array) return undefined;
    if (array.length === 1) return array[0];
    return {$and: array};
}

function get_array(filters) {
    if (!filters) return undefined;
    const length = Object.keys(filters).length;
    if (length === 0) return undefined;
    if (length === 1) {
        if (filters.$and) return filters.$and;
        else return [ filters ];
    } else if (!Array.isArray(filters)) {
        const array = [];
        for (const [key, value] of Object.entries(filters)) {
            array.push({[key]: value});
        }
        return array;
    }
    return filters;
}