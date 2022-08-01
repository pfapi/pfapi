'use strict';

const get_value = require('../utils/get-value');

/**
 * used by cacheable and redis cache
 * 
 * params: contains query related data
 * module_path: relative refreshable module path to project root
 * content_type: for content-type of HTTP response headers
 * timestamp: time in milliseconds after finishing get data call
 * modified_time: last time in milliseconds when data was modified
 * created_time: first time in milliseconds data (identified by key) was created
 * ttl: time in milliseconds to live
 * duration: time used in milliseconds for calling get data
 * count: sampled usage count, when data is get from local cache, it is not counted
 */

 const info_keys = [ 'params', 'module_path', 'content_type', 'checksum', 'timestamp', 
 'modified_time', 'created_time', 'ttl', 'duration', 'count' ];

module.exports.info_keys = info_keys;

module.exports.update_info = (object, result) => {
    for (const key in result) {
        if (!info_keys.includes(key)) continue;
        if (key === 'ttl' && object.ttl) continue;
        object[key] = get_value(result[key]);
    }
}