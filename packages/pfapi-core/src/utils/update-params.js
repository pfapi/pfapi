'use strict';

const get_dependency_key = require('./get-dependency-key');
const get_key_and_config = require('../app/get-key-and-config');
const merge_filters = require('./merge-filters');
const uids_config = require('../app/uids-config');

/**
 * 
 * @param {*} params 
 * @param {*} config for supporting preview
 * @returns 
 */
module.exports = (params, config) => {

    params.sort_default = !params.sort;
    
    if (params.fields && !params.fields.includes('id')) {
        params.fields.unshift('id');
    }

    if (params.handle) {
        
        let config_key;

        if (config) config_key = get_dependency_key({uid: uids_config.handle_uid, id: params.handle});
        else [config_key, config] = get_key_and_config(uids_config.handle_uid, params);

        if (config && config.params) {

            // merge_filters === false allows filters generated based only on config filters
            //
            const filters = params.merge_filters === false ? undefined : params.filters;
            const config_filters = config.params.filters;

            Object.assign(params, config.params);
            
            params.filters = merge_filters(filters, config_filters);
        }
    
        return config_key;
    }

}
