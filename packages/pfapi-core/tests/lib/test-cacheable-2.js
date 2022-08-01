'use strict';

const chai = require('chai');

const Cacheable = require('../../src/lib/cacheable');
const refreshable = require('../helpers/simple-refreshable');
const LocalCache = require('../../src/lib/local-cache');
const RedisCache = require('../../src/lib/redis-cache');

const sleep = require('../helpers/sleep');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-cacheable-2

describe('Test cacheable-2', () => {
   
    it('get with local cache only', async () => {

        const local_cache = new LocalCache();
        
        const delay_ms = 10;

        const cacheable = new Cacheable({params: {delay_ms}, refreshable});

        const result1 = await cacheable.get(local_cache);

        expect(result1).equals(true);

        //console.log(cacheable);
        expect(result1).equals(true);
        expect(cacheable.from).equals('fetch');

        const result2 = await cacheable.get(local_cache);

        expect(result2).equals(true);
        expect(cacheable.from).equals('local');

        await local_cache.stop();
    });

    it('get with redis cache only', async () => {

        const redis_cache = new RedisCache();
        
        await redis_cache.flushall();

        const delay_ms = 10;

        const cacheable = new Cacheable({params: {delay_ms}, refreshable});

        const result1 = await cacheable.get(undefined, redis_cache);

        expect(result1).equals(true);

        //console.log(cacheable);
        expect(result1).equals(true);
        expect(cacheable.from).equals('fetch');

        await sleep(200);

        const result2 = await cacheable.get(undefined, redis_cache);

        //console.log(cacheable);
        expect(result2).equals(true);
        expect(cacheable.from).equals('redis');

        await redis_cache.close();
    });

    it('get with local cache and redis cache', async () => {

        const local_cache = new LocalCache({default_ttl: 50});
        //console.log(local_cache)
        const redis_cache = new RedisCache();
        
        await redis_cache.flushall();

        const delay_ms = 10;

        const cacheable = new Cacheable({params: {delay_ms}, refreshable});

        const result1 = await cacheable.get(local_cache, redis_cache);

        expect(result1).equals(true);

        //console.log(cacheable);
        expect(result1).equals(true);
        expect(cacheable.from).equals('fetch');

        const result2 = await cacheable.get(local_cache, redis_cache);

        //console.log(cacheable);
        expect(result2).equals(true);
        expect(cacheable.from).equals('local');

        await sleep(50);

        const result3 = await cacheable.get(local_cache, redis_cache);

        //console.log(cacheable);
        expect(result3).equals(true);
        expect(cacheable.from).equals('redis');

        await local_cache.stop();
        await redis_cache.close();
    });

    it('get with early refresh', async () => {

        const local_cache = new LocalCache({default_ttl: 20});

        const redis_cache = new RedisCache();
        
        await redis_cache.flushall();

        const config = {early_refresh_duration: 10, early_refresh_start: 20};
        const delay_ms = 20;

        const cacheable = new Cacheable({params: {delay_ms}, refreshable}, config);

        const key = cacheable.key;

        const result1 = await cacheable.get(local_cache, redis_cache);

        expect(result1).equals(true);

        //console.log(cacheable);
        expect(result1).equals(true);
        expect(cacheable.from).equals('fetch');

        await sleep(30);

        const result2 = await cacheable.get(local_cache, redis_cache);

        //console.log(cacheable);
        expect(result2).equals(true);
        expect(cacheable.from).equals('redis');

        await sleep(150);

        //console.log(cacheable);
        expect(cacheable.from).equals('scheduled_fetch');

        const cacheable2 = new Cacheable({key}, config);
        const result3 = await cacheable2.get(local_cache, redis_cache);

        //console.log(cacheable2);
        expect(result3).equals(true);
        expect(cacheable2.from).equals('redis');

        await local_cache.stop();
        await redis_cache.close();

    });

});