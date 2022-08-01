'use strict';

const debug = require('debug')('pfapi:app-base');

const _ = require('lodash');
const get_checksum = require('../utils/get-checksum');
const get_dependency_key = require('../utils/get-dependency-key');
const { transform_config } = require('./handle-config');
const uids_config = require('./uids-config');
const default_configs = require('./default-configs');
const cache_requests = require('./cache-requests');
const get_pfapi_prop = require('../utils/get-pfapi-prop');
const HttpResponse = require('../lib/http-response');
const LocalCache = require('../lib/local-cache');
const RedisCache = require('../lib/redis-cache');
const HttpRequest = require('../lib/http-request');
const PfapiUids = require('./pfapi-uids');
const HttpThrottle = require('./http-throttle');
const Servers = require('./servers');

class AppBase extends HttpRequest {
    
    constructor(strapi) {
        super();
        this.strapi = strapi;
        global.PfapiApp = this;
        this.setup_app_config();
        this.config = this.get_app_config('AppBase');
        if (this.config.proxy !== false) {
            if (strapi) strapi.server.app.proxy = true;
        }
    }

    setup_app_config() {
        this.app_config = {};
        if (!this.strapi) return;
        const config = this.strapi.config.get('plugin.pfapi');
        if (!config) return;
        const path_key_config = []
        for (const [key, value] of Object.entries(config)) {
            if (!key.includes('.')) {
                this.app_config[key] = value;
            } else {
                path_key_config.push({key, value});
            }
        }
        for (const {key, value} of path_key_config) {
            const parts = key.split('.');
            if (!this.app_config[parts[0]]) continue;
            _.set(this.app_config, key, value);
        }
    }

    get_app_config(name) {
        const config = this.app_config[name];
        if (config) return config;
        return default_configs[name];
    }

    get_ip_list() {
        return this.get_config(uids_config.ips_uid) || [];
    }

    get_api_key_info(params) {
        const api_key = params.api_key || params['api-key'];
        if (api_key) {
            if (params.api_key) delete params.api_key;
            else delete params['api-key'];
            const {role, allow_preview} = this.get_config(uids_config.keys_uid, {key: api_key}) || {};
            return [ api_key, role, allow_preview ];
        } else {
            return [ api_key, 'Public', false ];
        }
    }

    get_permission_roles({uid, id}) {
        if (!uid || !this.strapi.contentTypes[uid]) {
            throw new Error(`Not Found - ${!uid ? 'no uid' : 'uid not found'}`);
        }
        const permissions = this.get_config(uids_config.permissions_uid);
        if (!permissions) return [];
        const action = `${uid}.${id ? 'findOne' : 'find'}`;
        return permissions[action] || [];
    }

    get_handle_config(handle) {
        const config_key = this.get_config_key(uids_config.handle_uid, {handle});
        return this.local_cache.get(config_key);
    }

    get_config_key(uid, data) {
        if (uid === uids_config.keys_uid) {
            if (!data || !data.key) throw new Error(`missing key for ${uid}`);
            return get_dependency_key({uid, id: data.key});
        } else if (uid === uids_config.handle_uid) {
            if (!data || !data.handle) throw new Error(`missing handle for ${uid}`);
            return get_dependency_key({uid, id: data.handle});
        } else if ([uids_config.ips_uid, uids_config.permissions_uid, uids_config.rate_limits_uid].includes(uid)) {
            return get_dependency_key({uid});
        } else {
            throw new Error(`${uid} is not support for config`);
        }
    }

    get_config(uid, data) {
        const config_key = this.get_config_key(uid, data);
        return this.local_cache.get(config_key);
    }

    get_key_and_config(uid, data) {
        const config_key = this.get_config_key(uid, data);
        const result = this.local_cache.get(config_key);
        return [config_key, result]; 
    }

    del_config(uid, data) {
        if (uid === uids_config.keys_uid) {
            const config_key = this.get_config_key(uid, data);
            this.local_cache.delete(config_key);
            const ids_map_key = get_checksum('ids_config_keys_map');
            const ids_map = this.local_cache.get(ids_map_key) || {};
            const str_id = String(data.id);
            delete ids_map[str_id];
        } else if (uid === uids_config.handle_uid) {
            const config_key = this.get_config_key(uid, data);
            this.local_cache.delete(config_key);
        } else if (uid === uids_config.ips_uid) {
            this.pfapi_uids.load_ips();
        } else if (uid === uids_config.permissions_uid) {
            this.pfapi_uids.load_permissions();
        } else if (uid === uids_config.rate_limits_uid) {
            this.pfapi_uids.load_rate_limits();
        } else {
            throw new Error(`${uid} is not support for del_config`);
        }
    }

    update_config(uid, data) {
        if (uid === uids_config.keys_uid) {
            if (data.role) {
                const role = data.role.name;
                const allow_preview = data.allow_preview;
                const config_key = this.get_config_key(uid, data);
                const current = this.local_cache.get(config_key);
                if (current === null || current.role !== role || current.allow_preview !== allow_preview) {
                    this.local_cache.put(config_key, {role, allow_preview}, true);
                }
                // removed old key if key changed
                const ids_map_key = get_checksum('ids_config_keys_map');
                const ids_map = this.local_cache.get(ids_map_key) || {};
                const str_id = String(data.id);
                const old_config_key = ids_map[str_id];
                if (old_config_key) {
                    if (old_config_key !== config_key) {
                        this.local_cache.delete(old_config_key);
                        ids_map[str_id] = config_key;
                    }
                } else {
                    ids_map[str_id] = config_key;
                }
            }
        } else if (uid === uids_config.handle_uid) {
            const config_key = this.get_config_key(uid, data);
            const {file_ids, config} = transform_config(data);
            const old_config = this.local_cache.get(config_key);
            const checksum = get_checksum(config);
            if (!old_config || checksum !== old_config.checksum) {
                config.checksum = checksum;
                config.modified_time = Date.now();
                config.timestamp = old_config?.timestamp || config.modified_time;
                this.update_file_dependency(file_ids, config_key);
                this.local_cache.put(config_key, config, true);
            }
        } else if (uid === uids_config.ips_uid) {
            this.pfapi_uids.load_ips();
        } else if (uid === uids_config.permissions_uid) {
            this.pfapi_uids.load_permissions();
        } else if (uid === uids_config.rate_limits_uid) {
            this.pfapi_uids.load_rate_limits();
        }
    }

    update_file_dependency(file_ids, config_key) {
        for (const id of file_ids) {
            const file_key = get_checksum({file_id: id});
            const config_keys = this.local_cache.get(file_key) || [];
            if (!config_keys.includes(config_key)) {
                config_keys.push(config_key);
                this.local_cache.put(file_key, config_keys, this.config.sync_interval || 3600000);
            }
        }
    }

    get_pfapi_config(ctx) {
        let result = get_pfapi_prop(ctx, 'config');
        if (result !== undefined) return result;
        if (ctx.params?.handle) {
            result = this.get_config(uids_config.handle_uid, { handle: ctx.params.handle });
        } else {
            result = null;
        }
        ctx.state.pfapi.config = result;
        return result;
    }

    async get_preview_config(ctx) {
        let result = get_pfapi_prop(ctx, 'config');
        if (result !== undefined) return result;
        if (ctx.params?.handle) {
            const items = await this.strapi.entityService.findMany(uids_config.handle_uid, {
                filters: {handle: ctx.params.handle}, publicationState: 'preview', populate: '*', limit: 1
            });
            if (items.length === 1) result = transform_config(items[0]).config;
        } else {
            result = null;
        }
        ctx.state.pfapi.config = result;
        return result;
    }


    get_params(ctx, config) {
        const params = _.cloneDeep(ctx.query);
        if (ctx.params) {
            for (const [key, value] of Object.entries(ctx.params)) {
                if (key === '0') continue;
                params[key] = value;
            }
        }
        if (!config) config = this.get_pfapi_config(ctx);
        if (config) {
            if (config.uid) {
                params.uid = config.uid;
            } else {
                throw new Error('Not Found - uid is not setup');
            }
        } else if (params.handle) {
            const cache_key = get_checksum('uid_models');
            const models = this.local_cache.get(cache_key);
            params.uid = models[params.handle];
            if (!params.uid) {
                throw new Error(`Not Found - no uid matches ${params.handle}`);
            }
        }
        if (params.id) {
            const id_field = config && config.id_field ? config.id_field : 'id';
            if (params.filters) {
                if (params.filters.$and) params.filters.$and.push({[id_field]: params.id})
                else params.filters[id_field] = params.id;
            } else {
                params.filters = {[id_field]: params.id};
            }
        }
        return params;
    }

    subscribe_lifecycle_events(uid, publish = true) {
        this.servers.subscribe_lifecycle_events(uid, publish);
    }

    async handle_cache_requests(ctx) {
        if (!process.env.DEBUG || !this.is_unlimited || !this.is_unlimited(ctx) || (
                process.env.DEBUG !== '*' && 
                !process.env.DEBUG.includes('pfapi:cache')  && 
                !process.env.DEBUG.includes('pfapi:*'))) {
            this.http_response.handle_error(ctx, 403, 'Forbidden', 'handle_cache_requests', { reason: 'Only available for debug and unlimited IP'});
        } else {
            await cache_requests(ctx, this.http_response, this.local_cache, this.redis_cache);
        }
    }

    async log_activity(ctx) {
        
        if (!this.strapi || !this.config.enable_log) return;

        const { status, method, path, state: { pfapi: { config, ...pfapi }, route: { handler } }} = ctx;
        const content_length = ctx.body ? ctx.body.length : 0;
        const data = {status, method, path, handler, content_length, ...pfapi};

        let activities = this.local_cache.get('pfapi-activities');
        if (activities) {
            activities.push(data);
        } else {
            activities = [ data ];
            const ttl = this.local_cache.config.timer_interval || 60000;
            this.local_cache.put('pfapi-activities', activities, ttl, async (items) => {
                const entries = [];
                for (let i = 0; i < items.length; i++) {
                    entries.push(items[i]);
                    if (entries.length === 256) {
                        await this.strapi.db.query(uids_config.activity_uid).createMany({data: entries});
                        entries.length = 0;
                    }
                }
                if (entries.length > 0) {
                    await this.strapi.db.query(uids_config.activity_uid).createMany({data: entries});
                }
            })

        }
    }

    async start() {

        debug('app_config', this.app_config);

        this.http_response = new HttpResponse(this);

        this.local_cache = new LocalCache();

        this.redis_cache = new RedisCache(this.get_app_config('redis_uri'));

        if (this.strapi) this.strapi.PfapiApp = this;

        this.throttle = new HttpThrottle(this);

        if (this.strapi) this.pfapi_uids = new PfapiUids(this);    

        this.servers = new Servers(this);

        this.started_at = Date.now();

        if (this.pfapi_uids) await this.pfapi_uids.start(this.config.sync_interval || 3600000);

        await this.servers.start(this.started_at, this.config.maintenance_interval || 100000);

    }

    async stop() {

        if (this.servers) {
            await this.servers.publish({action: 'shutdown'});
        }

        if (this.pfapi_uids) {
            await this.pfapi_uids.stop();
        }
        if (this.local_invalidate) {
            await this.local_invalidate.stop();
        }
        if (this.throttle) {
            await this.throttle.stop();
        }

        this.local_cache.stop();

        setTimeout(async () => {
            if (this.servers) {
                await this.servers.stop();
            }
            await this.redis_cache.close();
        }, 100);

    }
}

module.exports = AppBase;