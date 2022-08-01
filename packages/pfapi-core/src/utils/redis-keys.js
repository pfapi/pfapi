'use strict';

module.exports.get_redis_key = (prefix, key) => {
    if (!prefix) prefix = '';
    return `${prefix}::{${key}}`;
};

module.exports.get_prefix_key = (redis_key) => {
    const parts = redis_key.split('::');
    if (parts.length !== 2) {
        throw new Error('invalid redis_key format');
    }
    const prefix = parts[0];
    const key = parts[1].substr(1, parts[1].length - 2);
    return {prefix, key};
};

