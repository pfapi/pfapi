'use strict';

const chai = require('chai');
const Cacheable = require('../../src/lib/cacheable');
const RedisCache = require('../../src/lib/redis-cache');
const sleep = require('../helpers/sleep');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-redis-cache

describe('Test redis-cache', () => {

    it('set_cacheable and get_cacheable', async () => {

        const redis_cache = new RedisCache();

        await redis_cache.flushall();

        const cacheable1 = new Cacheable({key: 'test', params: {test: 1}, data: {test: 2}, duration: 10});
        const result1 = await redis_cache.set_cacheable(cacheable1);
        expect(result1).is.true;

        const cacheable2 = new Cacheable({key: 'test', params: {test: 1}, data: {test: 2}, duration: 100});
        const result2 = await redis_cache.set_cacheable(cacheable2);
        expect(result2).is.true;

        const cacheable3 = new Cacheable({key: 'test'});
        const result3 = await redis_cache.get_cacheable(cacheable3);
        expect(result3).is.true;
        expect(cacheable3.plain_object).to.deep.equals(cacheable2.plain_object);

        await sleep(200);
        expect(cacheable3).has.property('count');

        const cacheable4 = new Cacheable({key: 'test', params: {test: 1}, data: '', duration: 100});
        const result4 = await redis_cache.set_cacheable(cacheable4);
        expect(result4).is.true;

        const cacheable5 = new Cacheable({key: 'test'});
        const result5 = await redis_cache.get_cacheable(cacheable5);
        expect(result5).is.true;
        //console.log(cacheable5.plain_object, cacheable4.plain_object);
        expect(cacheable5.data).to.deep.equals(cacheable4.data);

        const cacheable6 = new Cacheable({key: 'test-not-existed'});
        const result6 = await redis_cache.get_cacheable(cacheable6);
        expect(result6).is.false;
        expect(cacheable6).not.has.property('data');

        await redis_cache.close();
    });

    it('set_cacheable and get_cacheable with dependencies', async () => {

        const redis_cache = new RedisCache();

        await redis_cache.flushall();

        const cacheable1 = new Cacheable({key: 'test', params: {test: 1}, data: {test: 2}, duration: 100, dependent_keys: ['k1', 'k2']});
        const result = await redis_cache.set_cacheable(cacheable1);
        expect(result).is.true;

        await sleep(300);
        const client = await redis_cache.get_client();
        const dependencies = await client.keys('DEP::*');
        //console.log(dependencies);
        expect(dependencies.length).equals(2);

        const cacheable2 = new Cacheable({key: 'test'});
        const result2 = await redis_cache.get_cacheable(cacheable2);
        expect(result2).is.true;

        expect(cacheable2.plain_object).to.deep.equals(cacheable1.plain_object);

        await sleep(200);
        expect(cacheable2).has.property('count');

        await redis_cache.close();

    });

    it('put_info and get_info', async () => {

        const redis_cache = new RedisCache();

        await redis_cache.flushall();

        const cacheable1 = new Cacheable({key: 'test', params: {test: 1}, duration: 100});
        const result = await redis_cache.set_info(cacheable1);
        expect(result).is.true;

        const cacheable2 = new Cacheable({key: 'test'});
        const result2 = await redis_cache.get_info(cacheable2);
        expect(result2).is.true;

        expect(cacheable2.plain_object).to.deep.equals(cacheable1.plain_object);

        await redis_cache.close();

    });

    it('delete', async () => {

        const redis_cache = new RedisCache();

        await redis_cache.flushall();

        const cacheable = new Cacheable({key: 'test', params: {test: 1}, data: {test: 2}, duration: 500});
        await redis_cache.set_cacheable(cacheable);

        const client = await redis_cache.get_client();
        const result1 = await client.keys('*');
        expect(result1.length).greaterThan(1);

        const result = await redis_cache.delete(cacheable);
        expect(result).is.true;
        const result2 = await client.keys('*');

        expect(result2.length).equals(1);

        await redis_cache.close();
    });

    it('delete_all', async () => {

        const redis_cache = new RedisCache();

        await redis_cache.flushall();

        const cacheable = new Cacheable({key: 'test', params: {test: 1}, data: {test: 2}, duration: 100});
        await redis_cache.set_cacheable(cacheable);

        const client = await redis_cache.get_client();
        const result1 = await client.keys('*');
        expect(result1.length).greaterThan(1);

        const result = await redis_cache.delete_all(cacheable);
        expect(result).is.true;
        const result2 = await client.keys('*');

        expect(result2.length).equals(0);

        await redis_cache.close();
    });

    it('get_dependencies', async () => {

        const redis_cache = new RedisCache();

        await redis_cache.flushall();

        const cacheable1 = new Cacheable({key: 'test', params: {test: 1}, data: {test: 2}, duration: 100, dependent_keys: ['k1', 'k2']});
        const result = await redis_cache.set_cacheable(cacheable1);
        expect(result).is.true;

        await sleep(300);

        const dependencies = await redis_cache.get_dependencies('k1');
        expect(dependencies.length).equals(1);
        expect(dependencies[0]).equals('test');

        await redis_cache.close();
    });
});