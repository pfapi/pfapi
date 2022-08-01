'use strict';

const _ = require('lodash');
const Refreshable = require('./refreshable');
const Cacheable = require('./cacheable');
const Composite = require('./composite');
const logging = require('../app/logging');
const get_pfapi_prop = require('../utils/get-pfapi-prop');

class HttpRequest {

    get_params(ctx) {
        return ctx.query;
    }

    is_blocked(ctx) {
        return false;
    }

    is_throttled(ctx) {
        return false;
    }

    is_auth(ctx, params) {
        return true;
    }

    // for handle preview
    //
    is_preview(ctx) {
        return false;
    }

    get_pfapi_config(ctx) {
        return null;
    }

    async get_preview_config(ctx) {
        return null;
    }
    
    defense_ok(ctx) {
        let ok = true;
        if (this.is_blocked(ctx)) {
            this.http_response.handle_error(ctx, 403, 'Forbidden');
            ok = false;
        } else if (this.is_throttled(ctx)) {
            this.http_response.handle_error(ctx, 429, 'Too Many Requests');
            ok = false;
        }
        return ok;
    }

    get_ss_rand(ctx) {
        let result = get_pfapi_prop(ctx, 'ss_rand');
        if (result !== undefined) return result;
        result = !!ctx.query.ss_rand;
        ctx.state.pfapi.ss_rand = result;
        return result;
    }

    /**
     * 
     * @param {*} ctx 
     * @param {*} object Refreshable or Composite
     */
    async handle(ctx, object) {
        
        this.get_ss_rand(ctx);

        ctx.state.pfapi.started_at_ms = Date.now();

        const start_time = process.hrtime.bigint();

        let cache_key;

        try {

            if (this.defense_ok(ctx)) {

                let config;
                
                if (this.is_preview(ctx)) {
                    config = await this.get_preview_config(ctx);
                }

                const params = this.get_params(ctx, config);

                if (!this.is_auth(ctx, params)) {

                    this.http_response.handle_error(ctx, 401, 'Unauthorized');

                } else if (object instanceof Refreshable) {

                    cache_key = await this.handle_refreshable_request(ctx, params, object);

                } else if (object instanceof Composite) {

                    cache_key = await this.handle_composite_request(ctx, params, object);

                } else {

                    this.http_response.handle_error(ctx, 500, 'Server Internal Error', 'handle', {reason: 'unknown object type'});

                }
            }

        } catch (err) {

            if (err.message.startsWith('Not Found')) {

                this.http_response.handle_error(ctx, 404, 'Not Found', 'handle', {reason: err.message});

            } else {

                logging.error(err);
                this.http_response.handle_error(ctx, 500, 'Server Internal Error', 'handle', {reason: err.message});
            }
        }

        const end_time = process.hrtime.bigint();
        const run_time = Math.round(Number(end_time - start_time) / 10000) / 100;

        ctx.state.pfapi.run_time = run_time;
        ctx.state.pfapi.cache_key = cache_key;

        if (this.config?.send_response_time) ctx.set('X-PFAPI-Response-Time', `${run_time} ms`);

        if (this.log_activity) this.log_activity(ctx);

        logging.info(`key: ${cache_key} ${run_time} ms ${ctx.path}`);
    }

    async handle_refreshable_request(ctx, params, refreshable) {

        const cacheable = new Cacheable({params, refreshable});
        
        if (this.is_preview(ctx)) {

            const config = await this.get_preview_config(ctx);

            await cacheable.get_data(config);

            this.http_response.handle_nocache_request(ctx, 200, cacheable.data, cacheable.content_type);

        } else if (this.get_ss_rand(ctx)) {

            if (await cacheable.get()) {

                this.http_response.handle_nocache_request(ctx, 200, cacheable.data, cacheable.content_type);

            } else {

                this.http_response.handle_error(ctx, 404, 'Not Found', 'handle_refreshable_request');

            }
        } else {

            if (await cacheable.get(this.local_cache, this.redis_cache)) {

                this.http_response.handle_cacheable_request(ctx, cacheable);

            } else {

                this.http_response.handle_error(ctx, 404, 'Not Found', 'handle_refreshable_request');
            }
        }
        
        return cacheable ? cacheable.key : null;
    }

    async handle_composite_request(ctx, params, composite)  {

        const data = {};

        const result = { data, params : [] };
    
        let config;
        
        if (this.is_preview(ctx)) {
            config = await this.get_preview_config(ctx);
        } else {
            config = this.get_pfapi_config(ctx);
        }

        if (config) {
            if (config.attributes) {
                Object.assign(data, config.attributes);
            }
            // this forces the composite key change if config checksum changed
            result.params.push(config.checksum);
            result.modified_time = config.modified_time;
            result.timestamp = config.timestamp;
        }

        // to preserve the order of keys
        for (const key in composite) data[key] = undefined;

        const promises = [];
    
        for (const [key, value] of Object.entries(composite)) {
            if (value instanceof Refreshable) {
                promises.push(this.run_refreshable(ctx, key, _.cloneDeep(params), value, result));
            } else if (data[key] === undefined) {
                data[key] = value;
            }
        }
    
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    
        composite.transform(data, params);
    
        let cacheable;

        if (this.get_ss_rand(ctx)) {
            this.http_response.handle_nocache_request(ctx, 200, data);
        } else {
            cacheable = new Cacheable(result);
            this.http_response.handle_cacheable_request(ctx, cacheable);
        }
    
        return cacheable ? cacheable.key : null;
    }

    async run_refreshable(ctx, key, params, refreshable, result) {

        try {
    
            const cacheable = new Cacheable({params, refreshable});
        
            if (this.is_preview(ctx)) {

                const config = await this.get_preview_config(ctx);

                await cacheable.get_data(config);

            } else if (this.get_ss_rand(ctx)) {

                if (!await cacheable.get()) {

                    result.data[key] = {message: 'Not Found'};
                    
                    return;
                }

            } else {

                if (await cacheable.get(this.local_cache, this.redis_cache)) {
                    const { timestamp, modified_time, ttl } = cacheable.plain_object;
                    if (!result.timestamp) result.timestamp = timestamp;
                    else if (result.timestamp < timestamp) result.timestamp = timestamp;
                    if (!result.modified_time) result.modified_time = modified_time;
                    else if (result.modified_time < modified_time) result.modified_time = modified_time;
                    if (result.ttl > ttl) result.ttl = ttl;
                } else {
                    result.data[key] = {message: 'Not Found'};
                    return;
                }
            }
            
            result.data[key] = cacheable.data;
            result.params.push(cacheable.key);
    
        } catch (err) {
            if (err.message.startsWith('Not Found')) {
                result.data[key] = {message: err.message};
            } else {
                logging.error(err);
                result.data[key] = {message: 'failed'};
            }
        }
    }
}

module.exports = HttpRequest;