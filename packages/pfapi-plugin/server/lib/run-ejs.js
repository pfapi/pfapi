'use strict';

const ejs = require('ejs');
const LRU = require('lru-cache');

ejs.cache = new LRU({ max: 1024, maxSize: 128 * 1024, ttl: 3600000} );

module.exports = (object) => {
    for (const [key, value] of Object.entries(object)) {
        if (typeof value !== 'string') continue;
        if (!value.includes('<%') || !value.includes('%>')) continue;
        try {
            object[key] = ejs.render(value, object);
        } catch(err) {
            object[key] = err.message;
        }
    }
}