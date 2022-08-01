'use strict';

const chai = require('chai');
const RedisBase = require('../../src/lib/redis-base');
const { run_script } = require('../helpers/run-script');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 10000 --reporter spec tests/lib/test-redis-base

describe('Test redis-base', () => {

    it('simple and list_clients', async () => {

        const redis = new RedisBase();
        const client = await redis.get_client();

        await client.set('test key', 'test value');
        const value = await client.get('test key');
        expect(value).equals('test value');
        
        const result = await redis.list_clients();
        //console.log(result);
        expect(result.length).greaterThan(0);

        await redis.close();
    });

    it('send_command', async () => {

        const redis = new RedisBase();
        const client = await redis.get_client();

        const result = await redis.send_command({client, cmd: 'CLIENT', argv: ['ID']});
        const client_id = await client.client('id');
        expect(result).equals(client_id);

        await redis.close();
    });

    it('list_commands', async () => {

        const redis = new RedisBase();

        const result = await redis.list_commands();
        expect(Array.isArray(result)).is.true;
        expect(result.length).greaterThan(100);

        await redis.close();
    });

    it('flushall', async () => {

        const redis = new RedisBase();
        const client = await redis.get_client();

        await client.set('test key', 'test value');
        const result = await redis.flushall();
        expect(result).is.true;
        const value = await client.get('test key');
        expect(value).is.null;
        
        await redis.close();
    });

    it('close', async () => {

        const redis = new RedisBase();
        const client = await redis.get_client();
        expect(redis.clients.length).equals(1);
        expect(redis.clients[0].client).equals(client);
        const client1 = await redis.get_client(true);
        expect(redis.clients.length).equals(2);
        await redis.close(client1);
        expect(redis.clients.length).equals(1);
        expect(redis.clients[0].client).equals(client);
        
        await redis.close();

        //console.log(redis.clients);
        expect(redis.clients.length).equals(0);
    });

    it('get_client_id and restart redis', async () => {

        const redis = new RedisBase();
        
        const client1 = await redis.get_client();
        const client1_id = await redis.get_client_id(client1);
        const client2 = await redis.get_client(true);
        const client2_id = await redis.get_client_id(client2);

        // redis in docker image doesn't change client id
        //console.log({client1_id, client2_id});
        //expect(client1_id).not.equal(client2_id);

        await client1.set('key1', 'test value1');
        await client2.set('key2', 'test value2');
        
        await run_script(__dirname + '/../helpers/restart-redis');
        
        const client1_id2 = await redis.get_client_id(client1);
        const client2_id2 = await redis.get_client_id(client2);

        // redis in docker image doesn't change client id
        //console.log({client1_id2, client2_id2});
        //expect(client1_id).not.equal(client1_id2);
        //expect(client2_id).not.equal(client2_id2);

        await client1.set('key1', 'test value3');
        await client2.set('key2', 'test value4');

        const values = await client1.mget(['key1', 'key2']);
        //console.log(values);
        expect(values[0]).equals('test value3');
        expect(values[1]).equals('test value4');

        await redis.close();
    });

});