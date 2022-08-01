'use strict';

const _ = require('lodash');
const get_checksum = require('../utils/get-checksum');
const { get_redis_key } = require('../utils/redis-keys');

/**
 * use sliding window with window size as step size to proximate total calls within a windows of time
 */
class Throttle {

    /**
     * 
     * @param {*} redis_cache 
     */
    constructor(redis_cache, local_cache) {
        if (!redis_cache || !local_cache) {
            throw new Error('missing required redis_cache');
        }
        this.redis_cache = redis_cache;
        this.local_cache = local_cache;
        this.throttles = [];
    }

    /**
     * reset throttles
     */
    reset() {
        this.throttles.length = 0;
    }

    /**
     * 
     * @param {*} window_secs 
     * @param {*} max_count 
     * @param {*} block_secs 
     */
    add_throttle(rate_limit) {
        if (!rate_limit.window_secs || !rate_limit.max_count) {
            throw new Error('add_throttle, missing required arguments window_secs and/or max_count: ' + JSON.stringify(rate_limit));
        }
        let { window_secs, max_count, block_secs, ...params} = rate_limit;
        if (!block_secs) block_secs = window_secs * 10;
        this.throttles.push({window_secs, max_count, block_secs, params});
    }

    /**
     * get a copy of current throttles
     * 
     * @returns 
     */
    get_throttles() {
        return _.cloneDeep(this.throttles);
    }

    /**
     * mechanism for group count into specific purpose and white list
     * 
     * for example: 
     * 
     *  a target is { ip: '1.2.3.4', path: '/api/v2/products/iphone10' }
     *  by reducing it to { ip: '1.2.3.4', path: '/api/v2/products' }
     *  it targets to the group of requests for the path prefix
     * 
     * by returning null means the target is white listed
     * by returning false means not match
     * 
     * @param {*} target for reducing
     * @param {*} params for matching pattern
     * @returns 
     */
    get_signature(target, params) {
        return target;
    }

    /**
     * call to check if the target is throttled, it also increments the count
     * 
     * @param {*} target 
     * @returns 
     */
    is_throttled(target) {
        const signatures = {};
        let count = 0;
        for (const throttle of this.throttles) {
            const signature = this.get_signature(target, throttle.params);
            if (signature === null) return null;
            if (signature === false) continue;
            const key = get_checksum({window_secs: throttle.window_secs, signature});
            signatures[key] = throttle;
            count++;
        }
        if (count === 0) return false;
        const handle = setTimeout(async () => {
            await this.update_target(signatures);
            clearTimeout(handle);
        }, 100);
        handle.unref();
        for (const key in signatures) {
            if (this.local_cache.has(key)) return true;
        }
        return false;
    }

    /**
     * cleanup created resource
     */
    stop() {
        this.reset();
    }

    async update_target(signatures) {
        const client = await this.redis_cache.get_client();
        const promises = [];
        for (const key in signatures) {
            promises.push(this.update_throttle(client, key, signatures[key]));
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }

    async update_throttle(client, key, throttle) {
        const {window_secs, max_count, block_secs} = throttle;
        const time = Math.round(Date.now() / 1000 / window_secs);
        const throttle_key = get_checksum({key, time});
        const redis_key = get_redis_key('THROTTLE', throttle_key);
        const count = await client.incr(redis_key);
        if (count === 1) {
            await client.pexpire(redis_key, window_secs * 1000);
        } else if (count >= max_count) {
            this.local_cache.put(key, 1, block_secs * 1000);
        }
    }
}

module.exports = Throttle;
