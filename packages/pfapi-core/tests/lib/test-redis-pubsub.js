'use strict';

const chai = require('chai');
const RedisBase = require('../../src/lib/redis-base');
const RedisPubsub = require('../../src/lib/redis-pubsub');
const sleep = require('../helpers/sleep');
const { run_script } = require('../helpers/run-script');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 10000 --reporter spec tests/lib/test-redis-pubsub

class TestRedisPubsub extends RedisPubsub {

    constructor(redis, for_test) {
        super(redis, {channel_name: 'TEST-CHANNEL', exclude_self: false});
        this.for_test = for_test;
    }

    async on_receive(message, from) {
        this.for_test.push({message, from});
    }
}

describe('Test redis-pubsub', () => {

    it('simple', async () => {

        const redis = new RedisBase();
        
        const for_test = [];
        const redis_pubsub = new TestRedisPubsub(redis, for_test);

        await redis_pubsub.start();

        redis_pubsub.publish({test: 'hello'});

        await sleep(300);

        //console.log(for_test);

        expect(for_test.length).equals(1)
        expect(for_test[0].from).equal(redis_pubsub.uuid);
        expect(for_test[0].message).to.deep.equal({ test: 'hello' });
        await redis_pubsub.stop();
        await redis.close();
    });

    it('restart redis', async () => {

        const redis = new RedisBase();
        
        const for_test = [];
        const redis_pubsub = new TestRedisPubsub(redis, for_test);

        await redis_pubsub.start();

        redis_pubsub.publish({test: 'hello'});

        await run_script(__dirname + '/../helpers/restart-redis');

        await sleep(1000);

        redis_pubsub.publish({test2: 'hello2'});

        for (let i = 0; i < 10; i++) {
            await sleep(200);
            if (for_test.length === 2) break;
        }

        //console.log(for_test);

        expect(for_test.length).equals(2)
        expect(for_test[1].from).equal(redis_pubsub.uuid);
        expect(for_test[1].message).to.deep.equal({ test2: 'hello2' });
        
        await redis_pubsub.stop();
        await redis.close();
    });
})
