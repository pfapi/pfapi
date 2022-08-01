'use strict';

const chai = require('chai');
const RedisCache = require('../../src/lib/redis-cache');
const { get_redis_key } = require('../../src/utils/redis-keys');
const ExpiresWatch = require('../../src/lib/expires-watch');
const sleep = require('../helpers/sleep');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-expires-watch

class ExpiresWatchTest extends ExpiresWatch {
    constructor(redis_cache, for_test) {
        super(redis_cache, for_test);
        this.for_test = for_test;
    }
    async on_expires(keys) {
        this.for_test.push(...keys);
    }
}

describe('test expires-watch', () => {

    it('simple basic', async () => {

        const redis_cache = new RedisCache();

        await redis_cache.flushall();

        const for_test = [];
        const test = new ExpiresWatchTest(redis_cache, for_test);
        await test.start();
        
        const client = await redis_cache.get_client();

        // should not see set
        const exp_key1 = await get_redis_key('EXP', 'key1');
        const result1 = await client.set(exp_key1, 1);
        expect(result1).equals('OK');

        await sleep(200);
        expect(for_test.length).equals(0);

        // should see deletes
        const result2 = await client.del(exp_key1);
        expect(result2).equals(1);

        await sleep(200);
        //console.log(for_test);
        expect(for_test.length).equals(1);
        expect(for_test[0]).equals('key1');
        for_test.length = 0;

        // should not see psetex
        const result3 = await client.psetex(exp_key1, 600, 2);
        expect(result3).equals('OK');
        await sleep(200);
        expect(for_test.length).equals(0);

        // should see expires
        await sleep(800);
        //console.log(for_test);
        expect(for_test.length).equals(1);
        expect(for_test[0]).equals('key1');
        
        await test.stop();
        await redis_cache.close();
    });
});