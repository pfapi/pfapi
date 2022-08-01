'use strict';

const chai = require('chai');

const Cacheable = require('../../src/lib/cacheable');
const LocalCache = require('../../src/lib/local-cache');

const sleep = require('../helpers/sleep');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-local-cache

describe('Test local-cache', () => {
   
    it('save, load, get, has, expiration', async () => {

        const local_cache = new LocalCache({default_ttl: 10 });
        
        const params = {x: 1};
        const data = {y: 2};
        const timestamp = Date.now() - 1000;
        const ttl = 3000;
        const cacheable = new Cacheable({params, data, timestamp, ttl});
        const key = cacheable.key;

        const result = local_cache.save(cacheable);

        //console.log(local_cache);

        expect(result).equals(true);
        expect(local_cache.size).equals(1);

        const cacheable2 = new Cacheable({key});
        const result2 = local_cache.load(cacheable2);

        expect(result2).equals(true);
        expect(cacheable2.data).to.deep.equal(cacheable.data);
        expect(local_cache.get(key)).to.deep.equal(cacheable.data);
        expect(local_cache.has(key)).equals(true);

        await sleep(15);

        const result3 = local_cache.load(new Cacheable({key}));
        expect(result3).equals(false);
        expect(local_cache.get(key)).equals(null)
        expect(local_cache.has(key)).equals(false);

        await local_cache.stop();
    });

    it('delete', async () => {

        const local_cache = new LocalCache({default_ttl: 10 });
        
        const params = {x: 1};
        const data = {y: 2};
        const timestamp = Date.now() - 1000;
        const ttl = 3000;
        const cacheable = new Cacheable({params, data, timestamp, ttl});
        const key = cacheable.key;

        local_cache.save(cacheable);

        local_cache.delete(key);

        const result = local_cache.load(new Cacheable({key}));
        expect(result).equals(false);
        expect(local_cache.get(key)).equals(null)
        expect(local_cache.has(key)).equals(false);

        await local_cache.stop();
    });

    it('permanent', async () => {

        const local_cache = new LocalCache({default_ttl: 10 });

        const result = local_cache.put('key', 'data', true);

        await sleep(20);

        expect(result).equals(true);
        expect(local_cache.size).equals(1);

        const cacheable2 = new Cacheable({key: 'key'});
        const result2 = local_cache.load(cacheable2);

        expect(result2).equals(true);
        expect(cacheable2.data).equals('data');

        await local_cache.stop();
    });

});