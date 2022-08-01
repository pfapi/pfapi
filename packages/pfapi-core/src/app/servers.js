'use strict';

const debug = require('debug')('pfapi:servers');
const debug_verbose = require('debug')('pfapi-verbose:servers');
const logging = require('./logging');

const RedisPubsub = require('../lib/redis-pubsub');
const Cacheable = require('../lib/cacheable');
const RefreshQueue = require('../lib/refresh-queue');
const ExpiresWatch = require('../lib/expires-watch');
const get_checksum = require('../utils/get-checksum');
const get_dependency_key = require('../utils/get-dependency-key');
const lifecycles = require('./lifecycles');
const uids_config = require('./uids-config');
const { delete_attrs_file, replace_attrs_file} = require('./handle-config');

class Servers extends RedisPubsub {

    constructor(app) {
        super(app.redis_cache);
        this.local_cache = app.local_cache;
        this.app = app;
        this.strapi = app.strapi;
        this.instances = [];
        this.subscribed_uids = [];
    }

    is_primary() {
        if (this.instances.length === 0) return false;
        return this.uuid === this.instances[0].uuid;
    }
    
    async on_receive(message, from) {
        debug_verbose(from, logging.cmsg(message));
        switch(message.action) {
            case 'keep-alive':
                this.update_instances(message, from);
                break;
            case 'shutdown':
                this.remove_instance(from);
                break;
            case 'subscribe-db-event': 
                this.subscribe_lifecycle_events(message.uid, false);
                break;
            case 'evict-local-cache': 
                this.evict_local_cache(message, from)
                break;
            case 'upsert':
                await this.on_db_upsert(message, from);
                break;
            case 'delete': 
                await this.on_db_delete(message, from);
                break;
            default:
                logging.error(`unknown action ${message.action}`);
        }
    }

    async start(started_at, maintenance_interval) {

        await RedisPubsub.prototype.start.call(this);

        await this.publish({action: 'keep-alive', started_at, now_ms: started_at});

        this.timer_handle = setInterval(async () => {

            const now_ms = Date.now();

            await this.publish({action: 'keep-alive', started_at, now_ms});
    
            for (let i = this.instances.length - 1; i >= 0; i--) {
                const instance = this.instances[i];
                if (now_ms - instance.now_ms > 3 * maintenance_interval) {
                    this.instances.splice(i, 1);
                }
            }
    
            if (now_ms - started_at > maintenance_interval * 3) {
                if (this.is_primary()) {
                    if (!this.refresh_queue) await this.start_refresh_queue()
                } else {
                    if (this.refresh_queue) await this.stop_refresh_queue();
                }
            }
        }, maintenance_interval)
    }

    async stop() {
        if (this.timer_handle) {
            clearInterval(this.timer_handle);
        }
        if (this.expires_watch) {
            await this.expires_watch.stop();
        }
        if (this.refresh_queue) {
            await this.refresh_queue.stop();
        }
        await RedisPubsub.prototype.stop();
    }

    async start_refresh_queue() {
        if (this.refresh_queue) {
            await this.refresh_queue.stop();
        }
        this.refresh_queue = new RefreshQueue(this.redis_cache, this.local_cache);
        await this.refresh_queue.start();
        if (this.expires_watch) {
            await this.expires_watch.stop();
        }
        this.expires_watch = new ExpiresWatch(this.redis_cache, this.refresh_queue);
        await this.expires_watch.start();
        logging.info(`expires watch/refresh started - ${this.uuid}`);
    }

    async stop_refresh_queue() {
        if (this.expires_watch) {
            await this.expires_watch.stop();
        }
        this.expires_watch = null;
        if (this.refresh_queue) {
            await this.refresh_queue.stop();
        }
        this.refresh_queue = null;
        logging.info(`expires watch/refresh stopped - ${this.uuid}`);
    }

    evict_local_cache({keys}, from) {
        if (from === this.uuid) return;
        if (!keys || keys.length === 0) return;
        for (const key of keys) this.local_cache.delete(key);
    }

    async on_db_upsert(message, from) {
        if (from && from === this.uuid) return;
        const {uid, data} = message;
        if (uid && data) {
            debug('on_db_upsert', uid, data.id);
            const uids = Object.values(uids_config);
            if (uids.includes(uid)) {
                if (uids_config.files_uid === uid) {
                    await this.on_file_change(data, replace_attrs_file);
                } else {
                    this.app.update_config(uid, data);
                    if (uids_config.handle_uid === uid) {
                        await this.evict_dependent(uid, data.handle);
                    }
                }
            } else if (data.id) {
                await this.evict_dependent(uid, data.id, true);
            }
        } else {
            logging.error('unknown on_db_upsert message', message);
        }
    }

    async on_db_delete(message, from) {
        if (from && from === this.uuid) return;
        const {uid, data} = message;
        if (uid && data) {
            debug('on_db_delete', uid, data.id);
            const uids = Object.values(uids_config);
            if (uids.includes(uid)) {
                if (uids_config.files_uid === uid) {
                    await this.on_file_change(data, delete_attrs_file);
                } else {
                    this.app.del_config(uid, data);
                    if (uids_config.handle_uid === uid) {
                        await this.evict_dependent(uid, data.handle);
                    }
                }
            } else {
                await this.evict_dependent(uid, data.id, true);
            }
        } else {
            logging.error('unknown on_db_delete message', message);
        }
    }

    async on_file_change(data, do_the_change) {
        const file_key = get_checksum({file_id: data.id});
        const config_keys = this.local_cache.get(file_key);
        if (!config_keys) return;
        for (const config_key of config_keys) {
            const config = this.local_cache.get(config_key);
            if (!config) continue;
            // this modify the data in the cache too
            do_the_change(config, data);
            const {checksum, modified_time, timestamp, ...rest } = config;
            config.checksum = get_checksum(rest);
            if (config.checksum !== checksum) {
                config.modified_time = Date.now();
                config.timestamp = timestamp;
                await this.evict_dependent_by_key(config_key);
            }
        }
    }

    update_instances(message, from) {
        if (!message.started_at) return;
        let instance = {uuid: from, started_at: message.started_at};
        if (this.instances.length > 0) {
            if (this.instances.find(x => x.uuid === from)) {
                instance = null;
            } else {
                for (let i = 0; i < this.instances.length; i++) {
                    const { uuid, started_at } = this.instances[i];
                    if (instance.started_at < started_at) {
                        this.instances.splice(i, 0, instance);
                        instance = null;
                        break;
                    } else if (instance.started_at === started_at && from > uuid) {
                        this.instances.splice(i, 0, instance);
                        instance = null;
                        break;
                    }
                }
            }
        }
        if (instance) this.instances.push(instance);
    }

    remove_instance(uuid) {
        const index = this.instances.findIndex(x => x.uuid === uuid);
        if (index !== -1) this.instances.splice(index, 1);
    }

    async evict_dependent(uid, id, with_uid = false) {
        const key = get_dependency_key({uid, id});
        const uid_key = with_uid ? get_dependency_key({uid}) : null;
        debug('evict_dependent', key, uid_key, uid, id);
        await this.evict_dependent_by_key(key, uid_key);
    }

    async evict_dependent_by_key(key, uid_key) {
        const keys = await this.redis_cache.get_dependencies(key);
        if (uid_key) {
            const uid_keys = await this.redis_cache.get_dependencies(uid_key);
            for (const key of uid_keys) {
                if (!keys.includes(key)) keys.push(key);
            }
        }
        if (keys.length === 0) return;
        for (const key of keys) {
            const cacheable = new Cacheable({key});
            const result = await cacheable.del(this.local_cache, this.redis_cache);
            debug('evict_dependent_by_key', logging.cmsg({key, result}));
        }
        this.publish({action: 'evict-local-cache', keys})
    }

    async after_upsert(event) {
        const uid = event.model.uid;
        if (!event.result.hasOwnProperty('publishedAt') || event.result.publishedAt) {
            const message = {uid, action: 'upsert', data: event.result};
            await this.on_db_upsert(message);
            await this.publish(message);
        } else if (event.params.data.publishedAt === null) {
            const message = {uid, action: 'delete', data: event.result};
            await this.on_db_delete(message);
            await this.publish(message);
        }
    }

    async after_delete(event) {
        const uid = event.model.uid;
        if (event.params.deleted_items) {
            for (const item of event.params.deleted_items) {
                if (!item.hasOwnProperty('publishedAt') || item.publishedAt) {
                    const message = {uid, action: 'delete', data: item};
                    await this.on_db_delete(message);
                    await this.publish(message);
                }
            }
        } else if (!event.result.hasOwnProperty('publishedAt') || event.result.publishedAt) {
            const message = {uid, action: 'delete', data: event.result};
            await this.on_db_delete(message);
            await this.publish(message);
        }
    }

    subscribe_lifecycle_events(uid, publish = true) {
        if (!uid) {
            logging.error('failed to subscribe_lifecycle_events, invalid uid');
            return;
        }
        if (this.subscribed_uids.includes(uid)) return;
        if (this.is_primary()) {
            // save the new the uid for other servers and restart 
            this.save_lifecycle_uid(uid);
        }
        this.subscribed_uids.push(uid);
        if (publish) this.publish({uid, action: 'subscribe-db-event'});
        this.strapi.db.lifecycles.subscribe(lifecycles(this, uid));
        logging.debug(`subscribe_lifecycle_events ${uid}`);
    }

    save_lifecycle_uid(uid) {
        this.strapi.entityService.findMany(uids_config.state_uid, {filters: {key: 'lifecycle_uids'}, limit: 1}).then(result => {
            if (result.length === 0) {
                this.strapi.entityService.create(uids_config.state_uid, {data: {key: 'lifecycle_uids', value: [uid]}});
            } else {
                const { id, value } = result[0];
                const lifecycle_uids = value || [];
                if (lifecycle_uids.includes(uid)) return;
                lifecycle_uids.push(uid);
                this.strapi.entityService.update(uids_config.state_uid, id, {data: {value: lifecycle_uids}});
            }
        })
    }
}

module.exports = Servers;