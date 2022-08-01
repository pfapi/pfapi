'use strict';

const AppBase = require('../../src/app/app-base');
const RedisCache = require('../../src/lib/redis-cache');
const LocalCache = require('../../src/lib/local-cache');

class SimplePfapiApp extends AppBase {

    constructor() {
        super();
        this.local_cache = new LocalCache;
        this.redis_cache = new RedisCache();
    }
}

module.exports = new SimplePfapiApp();