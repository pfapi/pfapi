'use strict';

const _ = require('lodash');

const { info_keys, update_info } = require('./info-keys'); 
const get_checksum = require('../utils/get-checksum');
const get_cache_key = require('../utils/get-cache-key');
const get_config = require('../app/get-config');
const get_body = require('../utils/get-body');
const get_value = require('../utils/get-value');
const get_dependent_keys = require('../app/get-dependent-keys');
const update_params = require('../utils/update-params');
const debug = require('debug')('pfapi:cacheable');

const Refreshable = require('./refreshable');

class Cacheable {

    /**
     * constructor
     * 
     * @param {*} object can have keys in info_keys, 'key', 'data', 'dependent_keys' and refreshable object
     * @param {*} config for testing and per instance config 
     */
    constructor(object, config) {
        if (object.refreshable) {
            this.refreshable = object.refreshable;
            this.module_path = this.refreshable.module_path;
        }
        this.plain_object = object;
        this.config = get_config('Cacheable');
        if (config) Object.assign(this.config, config);
        if (process.env.NODE_ENV === 'test') this.from = '';
    }

    /**
     * it tries to get the data from local cache first, then redis cache, finally from refreshable get_data
     * it updates caches that don't have the data
     *  
     * @param {*} local_cache an instance of LocalCache
     * @param {*} redis_cache an instance of RedisCache
     * @returns true if succeeded, otherwise false
     */
    async get(local_cache, redis_cache) {
        if (local_cache && local_cache.load(this)) {
            if (process.env.NODE_ENV === 'test') this.from = 'local';
            return true;
        }
        if (redis_cache) {
            if (await redis_cache.get_cacheable(this)) {
                if (local_cache) local_cache.save(this);
                if (process.env.NODE_ENV === 'test') this.from = 'redis';
                if (this.is_refreshable) this.early_refresh(redis_cache);
                return true;
            }
        }
        if (await this.fetch_data(redis_cache)) {
            if (local_cache && this.data !== undefined) {
                local_cache.save(this);
            }
            if (process.env.NODE_ENV === 'test') this.from = 'fetch';
            return true;            
        }
        return false;
    }

    /**
     * delete the cacheable from redis and local cache
     * 
     * @param {*} local_cache an instance of LocalCache
     * @param {*} redis_cache an instance of RedisCache
     * @param {*} ignore_invalidation ignore invalidation
     */
    async del(local_cache, redis_cache, ignore_invalidation = false) {
        let result = false;
        if (redis_cache) {
            result = await redis_cache.delete(this, ignore_invalidation);
        }
        if (local_cache) {
            result = local_cache.delete(this.key);
        }
        return result;
    }

    /**
     * convert to plain old javascript object
     * 
     * @returns 
     */
    get plain_object() {
        const plain_object = {key: this.key, data: this.data};
        for (const key of info_keys) {
            if (key === 'ttl') {
                plain_object[key] = this.data_ttl;
                continue;
            }
            if (this.hasOwnProperty(key)) {
                plain_object[key] = this[key];
            }
        }
        return plain_object;
    }

    /**
     * convert from plain object
     * 
     * @param {*} plain_object  
     */
    set plain_object(plain_object) {
        if (plain_object.key) this.key = plain_object.key;
        if (plain_object.data !== undefined) this.data = plain_object.data;
        if (plain_object.dependent_keys) this.dependent_keys = plain_object.dependent_keys;
        for (const key of info_keys) {
            if (plain_object.hasOwnProperty(key)) {
                if (key === 'ttl' && this.ttl) continue;
                this[key] = plain_object[key];
            }
        }
        if (!this.refreshable && this.module_path) {
            this.refreshable = new Refreshable(this.module_path);
        }
        if (!this.params) this.params = {};
        if (this.refreshable) {
            const handle = this.params.handle;
            this.params = this.refreshable.reduce(this.params);
            if (handle && !this.params.handle) this.params.handle = handle;
            for (const [key, value] of Object.entries(this.params)) {
                if (value === undefined) delete this.params[key];
            }
            const key = get_cache_key(this);
            if (!this.key) this.key = key;
            else if (this.key !== key) {
                delete this.timestamp;
                delete this.created_time;
                delete this.duration;
                this.key = key;
            }
        } else if (!this.key) {
            for (const [key, value] of Object.entries(this.params)) {
                if (value === undefined) delete this.params[key];
            }
            this.key = get_cache_key(this);
        }
        if (!this.checksum && this.hasOwnProperty('data')) {
            this.checksum = get_checksum(this.data);
        }
    }

    // helper function, update info from redis result
    //
    set info(result) {
        update_info(this, result);
        if (this.module_path && !this.refreshable) {
            this.refreshable = new Refreshable(this.module_path);
        }
    }

    // helper function, prepare for redis set data
    //
    get data_value() {
        return get_body(this.data);
    }

    // helper function, parse result from redis get data
    //
    set data_value(value) {
        this.data = get_value(value);
    }

    // helper function, prepare hmset args for info
    //
    get info_args() {
        // count does't update, only do increments
        const args = [];
        for (const key of info_keys) {
            if (key === 'count' || !this.hasOwnProperty(key)) continue;
            const value = key === 'ttl' ? this.data_ttl : this[key];
            if (value === undefined) continue;
            args.push(key, get_body(this[key]));
        }
        return args;
    }

    get is_refreshable() {
        return !!this.module_path;
    }

    // to delay the decision of using default to the time needs it
    //
    get data_ttl() {
        if (!this.hasOwnProperty('ttl')) {
            this.ttl = this.config.ttl || 900;
        }
        return this.ttl;
    }

    // for slow get_data calls, extra_ttl will help the refresh mechanism 
    // to avoid calling it during serving the actual request
    //
    get extra_ttl() {
        return this.duration >= this.config.slow_duration ? this.config.extra_ttl : 0;
    }
    
    get info_ttl() {
        return this.config.info_ttl; // typical 24 hours
    }

    // call within redis_cache, if it is fast enough, no need to setup refresh
    //
    get to_refresh() {
        return this.refreshable && this.duration >= this.config.refresh_duration;
    }

    /**
     * for costly slow get data from source,
     * we can do scheduled fetch when it closes to expiration
     * without delay on current call
     * 
     * @param {*} redis_cache 
     */
    early_refresh(redis_cache) {
        if (!this.timestamp || !this.duration) return;
        if (this.duration < this.early_refresh_duration) return;
        if (Date.now() - this.timestamp < this.config.early_refresh_start) return;
        this.scheduled_fetch(redis_cache);
    }

    /**
     * 
     * no blocking async scheduled fetch data
     * 
     * @param {*} redis_cache 
     */
    scheduled_fetch(redis_cache, after_ms = 100) {
        if (!redis_cache) return;
        const handle = setTimeout(async () => {
            if (global.strapi && await this.fetch_data(redis_cache)) {
                if (process.env.NODE_ENV === 'test') this.from = 'scheduled_fetch';
            }
            clearTimeout(handle);
        }, after_ms);
        handle.unref();
    }

    /**
     * fetch data from source and save result to redis
     * 
     * @param {*} redis_cache
     * @returns 
     */
    async fetch_data(redis_cache) {
        if (!this.params || !this.module_path) {
            if (!redis_cache || !await redis_cache.get_info(this)) {
                return false;
            }
        }
        if (!this.params || !this.module_path) {
            return false;
        }
        if (!this.refreshable) {
            this.refreshable = new Refreshable(this.module_path);
        }
        await this.get_data();
        if (redis_cache) {
            await redis_cache.set_cacheable(this);
        }
        return true;
    }

    /**
     * @param {*} config for supporting preview 
     * get_data, it consequently calls to get_data of refreshable.
     * 
     * @returns no returns, throw exception if fails
     */
    async get_data(config) {
        const previous_checksum = this.checksum;
        const start_ms = Date.now();
        const params = _.cloneDeep(this.params);
        const config_key = update_params(params, config);
        const result = await this.refreshable.get_data(params);
        if (!result || result.data === undefined || result.data === null) {
            throw new Error('Not Found - get_data');
        }
        this.data = result.data;
        this.timestamp = Date.now();
        if (!this.created_time) this.created_time = this.timestamp;
        this.duration = this.timestamp - start_ms;
        const ttl = this?.tll || this.config.ttl;
        if (ttl < this.duration) this.ttl = this.duration;
        this.checksum = get_checksum(this.data);
        const changed = previous_checksum !== this.checksum;
        if (changed) this.modified_time = this.timestamp;
        if (result.content_type) this.content_type = result.content_type;
        if (result.dependencies) this.dependent_keys = get_dependent_keys(result.dependencies);
        if (config_key) {
            if (this.dependent_keys) this.dependent_keys.push(config_key);
            else this.dependent_keys = [ config_key ];
        }
        debug('config key', config_key);
        debug('dependent_keys', this.dependent_keys ? this.dependent_keys.length : null);
    }
}

module.exports = Cacheable;