'use strict';

const chai = require('chai');
const RedisBase = require('../../src/lib/redis-base');
const { on_invalidate, off_invalidate } = require('../../src/lib/redis-invalidate');
const sleep = require('../helpers/sleep');
const { run_script } = require('../helpers/run-script');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 10000 --reporter spec tests/lib/test-redis-invalidate

class InvalidateWatch {

    constructor(redis,  for_test) {
        this.redis = redis;
        this.for_test = for_test;
    }

    async start() {
        const on_event = (keys) => this.for_test.push(...keys);
        this.subscribe_client = await on_invalidate(this.redis, on_event, {prefix: 'TEST::', noloop: false});
    }

    async stop() {
        if (!this.subscribe_client) return;
        await off_invalidate(this.redis, this.subscribe_client);
        await this.redis.close(this.subscribe_client);
    }

}

describe('Test redis-invalidate', () => {

    it('simple', async () => {

        const redis = new RedisBase();
        
        const for_test = [];
        const invalidate_watch = new InvalidateWatch(redis, for_test);

        await invalidate_watch.start();

        const client = await redis.get_client();

        await client.set('TEST::key', 'test value');
        await client.del('TEST::key')
        //await client.set('key', 'value');
        
        await sleep(200);

        //console.log(for_test);
        expect(for_test).to.deep.equal([ 'TEST::key', 'TEST::key' ]);

        await invalidate_watch.stop();
        await redis.close();
    });

    it('restart redis', async () => {

        const redis = new RedisBase();
        
        const for_test = [];
        const invalidate_watch = new InvalidateWatch(redis, for_test);

        await invalidate_watch.start();

        const client = await redis.get_client();

        await client.set('TEST::key1', 'test value');

        await run_script(__dirname + '/../helpers/restart-redis');

        await sleep(1000);

        await client.set('TEST::key2', 'test value');

        for (let i = 0; i < 10; i++) {
            await sleep(200);
            if (for_test.length === 2) break;
        }

        //console.log(for_test);
        expect(for_test).to.deep.equal([ 'TEST::key1', 'TEST::key2' ]);

        await invalidate_watch.stop();
        await redis.close();
    });
})
