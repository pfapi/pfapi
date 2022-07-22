'use strict';

const { Refreshable, logging, run_filters } = require('./');

class GetFilters extends Refreshable {

    reduce(params) {
        logging.debug('GetFilters reduce', params);
        const {uid, fields, filters, sort, populate, publicationState, locale, delay} = params;
        // merge_filters === false allows filters generated based only on config filters
        let merge_filters = false;
        if (params.merge_filters === true || params.merge_filters === '1' || params.merge_filters === 'true') {
            merge_filters = true;
        }
        return {uid, fields, filters, sort, populate, publicationState, locale, merge_filters, delay}
    }

    async get_data(params) {
        logging.debug('GetFilters get_data', params);
        const {uid, filters_config, delay, ...rest} = params;
        if (!uid) return null;
        const data = await run_filters(uid, filters_config, rest);
        const dependencies = [{uid}];
        if (delay) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return { data, dependencies };
    }
}

module.exports = new GetFilters(__filename);