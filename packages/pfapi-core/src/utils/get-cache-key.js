'use strict';

const get_checksum = require('./get-checksum');

module.exports = ({params, module_path}) => {
    if (!params) {
        throw new Error('failed to generate cache key, missing params');
    }
    return get_checksum({params, module_path});
};