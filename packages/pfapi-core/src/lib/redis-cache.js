'use strict';

const { update_info } = require('./info-keys');
const get_value = require('../utils/get-value');
const { get_redis_key, get_prefix_key } = require('../utils/redis-keys');
const RedisBase = require('./redis-base');
const logging = require('../app/logging');
const debug = require('debug')('pfapi:redis-cache');

class RedisCache extends RedisBase {
    
    async get_cacheable(cacheable) {
        if (!cacheable.key) {
            throw new Error('get_cacheable, no key in cacheable object');
        }
        const client = await this.get_client();
        const data_key = get_redis_key('DATA', cacheable.key);
        const info_key = get_redis_key('INFO', cacheable.key);
        const multi = client.multi();
        multi.hgetall(info_key);
        multi.get(data_key);
        const result = await multi.exec();
        if (result.length !== 2) return false;
        if (!result[0][1] || Object.keys(result[0][1]).length === 0) return false;
        else cacheable.info = result[0][1];
        if (result[1][1] === null) return false;
        cacheable.data_value = result[1][1];
        client.hincrby(info_key, 'count', 1).then((x) => cacheable.count = x);
        return true;
    }

    async set_cacheable(cacheable) {
        if (!cacheable.key || (cacheable.data === null || cacheable.data === undefined)) {
            throw new Error('set_cacheable, no key or/and data in cacheable object');
        }
        const client = await this.get_client();
        const data_key = get_redis_key('DATA', cacheable.key);
        const info_key = get_redis_key('INFO', cacheable.key);
        const exp_key = get_redis_key('EXP', cacheable.key);
        const data_ttl = cacheable.data_ttl + cacheable.extra_ttl;
        const multi = client.multi();
        multi.psetex(data_key, data_ttl, cacheable.data_value);
        multi.hmset(info_key, ...cacheable.info_args);
        let count = 2;
        // to allow info_key to expire within cacheable.info_ttl
        if (cacheable.created_time === cacheable.timestamp) {
            multi.pexpire(info_key, cacheable.info_ttl);
            count++;
        }
        if (cacheable.to_refresh) {
            const ttl = cacheable.data_ttl;
            const value = JSON.stringify({timestamp: Date.now, ttl});
            multi.psetex(exp_key, ttl, value);
            count++;
        }
        const result = await multi.exec();
        if (cacheable.dependent_keys) {
            this.update_dependencies(client, cacheable, data_ttl);
        }
        return result.length === count;
    }

    async get_info(cacheable) {
        if (!cacheable.key) {
            throw new Error('get_info, no key in cacheable object');
        }
        const client = await this.get_client();
        const info_key = get_redis_key('INFO', cacheable.key);
        const result = await client.hgetall(info_key);
        if (!result || Object.keys(result).length === 0) return false;
        cacheable.info = result;
        client.pexpire(info_key, cacheable.info_ttl);
        return true;
    }

    async set_info(cacheable) {
        if (!cacheable.key || !cacheable.params) {
            throw new Error('set_info, no key or/and params in cacheable object');
        }
        const client = await this.get_client();
        const info_key = get_redis_key('INFO', cacheable.key);
        const multi = client.multi();
        multi.hmset(info_key, ...cacheable.info_args),
        multi.pexpire(info_key, cacheable.info_ttl);
        const result = await multi.exec();
        return result.length === 2;
    }

    async delete(cacheable, ignore_invalidation = false) {
        if (!cacheable.key) {
            throw new Error('delete, no key in cacheable object');
        }
        const client = await this.get_client();
        const data_key = get_redis_key('DATA', cacheable.key);
        const exp_key = get_redis_key('EXP', cacheable.key);
        let count = 2;
        const multi = client.multi();
        if (ignore_invalidation) {
            const no_exp_key = 'NO-' + exp_key;
            multi.psetex(no_exp_key, 3000, 1);
            count++;
        }
        multi.del(data_key);
        multi.del(exp_key);
        const result = await multi.exec();
        return result.length === count;
    }

    async delete_all(cacheable) {
        if (!cacheable.key) {
            throw new Error('delete, no key in cacheable object');
        }
        const client = await this.get_client();
        const data_key = get_redis_key('DATA', cacheable.key);
        const info_key = get_redis_key('INFO', cacheable.key);
        const exp_key = get_redis_key('EXP', cacheable.key);
        const multi = client.multi();
        multi.del(data_key);
        multi.del(info_key);
        multi.del(exp_key);
        const result = await multi.exec();
        return result.length === 3;
    }

    async has_data(key) {
        const client = await this.get_client();
        const data_key = get_redis_key('DATA', key);
        const value = await client.exists(data_key);
        return !!value;
    }

    async get_dependencies(dependency_key) {
        const dep_key = get_redis_key('DEP', dependency_key);
        const client = await this.get_client();
        return await client.smembers(dep_key);
    }

    update_dependencies(client, cacheable, data_ttl) {
        const handle = setTimeout(async () => {
            debug('update_dependencies', cacheable.dependent_keys?.length);
            for (const key of cacheable.dependent_keys) {
                const dep_key = get_redis_key('DEP', key);
                const multi = client.multi();
                multi.sadd(dep_key, cacheable.key);
                multi.pexpire(dep_key, data_ttl);
                const result = await multi.exec();
                if (result.length !== 2 || result[1][1] !== 1) {
                    logging.error(`update_dependencies, failed for ${key}`, result);
                }
            }
            clearTimeout(handle);
        }, 100);
        handle.unref();
    }

    /**
     * helper methods for debug only
     */

    /**
     * get data associated with a key
     * 
     * @param {*} key 
     * @returns 
     */
    async get(key) {
        const client = await this.get_client();
        const data_key = get_redis_key('DATA', key);
        const info_key = get_redis_key('INFO', key);
        const dep_key = get_redis_key('DEP', key);
        const multi = client.multi();
        multi.get(data_key);
        multi.hgetall(info_key);
        multi.smembers(dep_key);
        const result = await multi.exec();
        if (result.length !== 3) return null;
        const data = {};
        if (result[0][1] && Object.keys(result[0][1]).length > 0) {
            data.data = get_value(result[0][1]);
            data.data_ttl = await client.ttl(data_key);
        }
        if (result[1][1] && Object.keys(result[1][1]).length > 0) {
            data.info = {};
            update_info(data.info,  result[1][1]);
            data.info_ttl = await client.ttl(info_key);
        }
        if (result[2][1] && Object.keys(result[2][1]).length > 0) {
            data.dep = result[2][1];
            data.dep_ttl = await client.ttl(dep_key);
        } else {
            const client = await this.get_client();
            const deps_keys = await client.keys('DEP::*');
            data.dependents = [];
            for (const dep_key of deps_keys) {
                if (await client.sismember(dep_key, key)) {
                    const ttl = await client.ttl(dep_key);
                    const result = get_prefix_key(dep_key);
                    data.dependents.push({key: result.key, ttl});
                }
            }
        }
        return data;
    }

    /**
     * list all data
     * 
     * @param {*} query 
     * @returns 
     */
    async list(query) {
        const client = await this.get_client();
        const data_keys = await client.keys('DATA::*');
        if (data_keys.length === 0) return [];
        const values = await client.mget(data_keys);
        const data = [];
        for (let i = 0; i < data_keys.length; i++) {
            let value = values[i];
            if (!value) continue;
            const { key } = get_prefix_key(data_keys[i]);
            data.push({[key]: get_value(value)});
        }
        if (!query || Object.entries(query).length === 0) {
            return data;
        } else {
            const result = [];
            for (const item of data) {
                const [ key, value ] = Object.entries(item)[0];
                let matched = true;
                for (const key in query) {
                    matched = String(value[key]) === query[key];
                    if (!matched) break;
                }
                if (matched) result.push({[key]: value})
            }
            return result;
        }
    }

    /**
     * list all dependent keys
     * 
     * @returns 
     */
    async deps() {
        const client = await this.get_client();
        const deps_keys = await client.keys('DEP::*');
        if (deps_keys.length === 0) return [];
        const data = [];
        for (const dep_key of deps_keys) {
            const keys = await client.smembers(dep_key);
            const ttl = await client.ttl(dep_key);
            const { key } = get_prefix_key(dep_key);
            data.push({[key]: {ttl, keys}});
        }
        return data;
    }
}

module.exports = RedisCache;