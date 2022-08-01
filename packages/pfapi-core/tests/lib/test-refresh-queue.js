'use strict';

const chai = require('chai');
const Cacheable = require('../../src/lib/cacheable');
const RefreshQueue = require('../../src/lib/refresh-queue');
const LocalCache = require('../../src/lib/local-cache');
const RedisCache = require('../../src/lib/redis-cache');
const refreshable = require('../helpers/simple-refreshable');
const sleep = require('../helpers/sleep');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-refresh-queue

class RefreshQueueTest extends RefreshQueue {
    constructor(redis_cache, local_cache, for_test) {
        super(redis_cache);
        this.for_test = for_test;
    }
    async on_refresh(key) {
        this.for_test.push(key);
        return await RefreshQueue.prototype.on_refresh(key);
    }
}

describe('test refresh-queue', () => {

    it('push and do_refresh', async () => {

        const redis_cache = new RedisCache();
        const local_cache = new LocalCache();

        await redis_cache.flushall();

        const for_test = [];

        const refresh_queue = new RefreshQueueTest(redis_cache, local_cache, for_test);
        
        refresh_queue.start();

        const params = {delay_ms: 30};
        const cacheable1 = new Cacheable({params, refreshable});
        const result0 = await cacheable1.get(null, redis_cache);
        expect(result0).is.true;
        const result1 = await refresh_queue.push([cacheable1.key]);
        expect(result1).is.true;

        const size = await refresh_queue.get_refresh_queue_size();
        expect(size).equals(1);

        await refresh_queue.do_refresh();

        //console.log(for_test);
        expect(for_test.length).equals(1);
        expect(for_test[0]).equals(cacheable1.key);

        await sleep(10);

        const cacheable2 = new Cacheable({key: cacheable1.key});
        const result2 = await cacheable2.get(null, redis_cache);
        expect(result2).is.true;
        expect(cacheable2.from).equals('redis');

        refresh_queue.stop();
        local_cache.stop();
        await redis_cache.close();
    });

    it('add_refresh_queue, get_refresh_queue_size and pop_refresh_queue', async () => {

        const redis_cache = new RedisCache();
        const local_cache = new LocalCache();

        await redis_cache.flushall();
        await redis_cache.flushall();

        const refresh_queue = new RefreshQueueTest(redis_cache, local_cache);

        const result1 = await refresh_queue.push_refresh_queue([20, 'key2']);
        expect(result1).is.true;

        const result2 = await refresh_queue.push_refresh_queue([30, 'key3', 10, 'key1']);
        expect(result2).is.true;

        const size = await await refresh_queue.get_refresh_queue_size();
        expect(size).equals(3);

        const result = await refresh_queue.pop_refresh_queue();
        expect(result).to.deep.equals({score: 30, key: 'key3'});

        local_cache.stop();
        await redis_cache.close();
    });

});