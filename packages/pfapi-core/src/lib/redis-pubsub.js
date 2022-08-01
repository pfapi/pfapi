'use strict';

const { v4: uuidv4 } = require('uuid');
const get_config = require('../app/get-config');
const logging = require('../app/logging');

/**
 * redis pub sub with mechanism to exclude message from self
 */
class RedisPubsub {

    constructor(redis_cache) {
        if (!redis_cache) {
            throw new Error('missing required redis_cache');
        }
        this.redis_cache = redis_cache;
        this.uuid = uuidv4();
        this.config = get_config('RedisPubsub');
    }

    async start() {
        this.queue = [];
        this.interval_handle = setInterval(async () => {
            if (this.queue.length === 0) return;
            const queue = this.queue;
            this.queue = [];
            const promises = [];
            for (const {message, from} of queue) {
                promises.push(this.on_receive(message, from));
            }
            await Promise.all(promises);
        }, 200);
        this.pubsub_client = await this.on_pubsub(this.config.channel_name, (event) => {
            const json = JSON.parse(event);
            if (this.config.exclude_self && json.from === this.uuid) return;
            const {message, from} = json;
            this.queue.push({message, from});
        });
    }

    async publish(message) {
        const event = {from: this.uuid, message};
        const client = await this.redis_cache.get_client();
        return await client.publish(this.config.channel_name, JSON.stringify(event));
    }

    async on_receive(message, from) {
        //console.log(message, from);
    }

    async stop() {
        if (!this.pubsub_client) return;
        if (this.interval_handle) {
            clearInterval(this.interval_handle);
            this.interval_handle = null;
        }
        await this.turnoff_pubsub(this.pubsub_client, this.config.channel_name);
        await this.redis_cache.close(this.pubsub_client);
        this.pubsub = null;
    }

    // support functions

    async on_pubsub(channel_name, on_event) {

        const subscribe_client = await this.redis_cache.get_client(async (new_client) => {
            try {
                const subscribe_result = await new_client.subscribe(channel_name);
                if (subscribe_result !== 1) {
                    logging.error('on_pubsub, failed to subscribe');
                    await this.close(subscribe_client);
                    return;
                }
                const id = await this.redis_cache.get_client_id(new_client);
                new_client.on('message', async (channel, data) => {
                    const current_id = await this.redis_cache.get_client_id(new_client);
                    if (current_id !== id) {
                        await new_client.unsubscribe(channel);
                        return;
                    }
                    await on_event(data);
                });
            } catch(err) {
                logging.error(err);
            }
        });

        return subscribe_client;
    }
    
    async turnoff_pubsub(subscribe_client, channel) {
        await subscribe_client.unsubscribe(channel);
    }
}

module.exports = RedisPubsub;