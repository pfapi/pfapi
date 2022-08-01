'use strict';

const chai = require('chai');
const axios = require('axios');

const { run_script2, kill_script } = require('../helpers/run-script');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-http-request

describe('Test http-request', () => {
   
    before(async() => {
        await run_script2('node', `${process.cwd()}/tests/helpers/koa-server.js`);
    });

    it('test random', async () => {

        const {status, headers, data} = await axios.get('http://localhost:3000/random');
        //console.log(status, headers, data);
        expect(status).equals(200);
        expect(headers).has.ownProperty('date')
        expect(headers).has.ownProperty('last-modified')
        expect(headers).has.ownProperty('etag')
        expect(headers).has.ownProperty('cache-control');
        expect(headers).has.ownProperty('expires')
        expect(headers).has.ownProperty('x-pfapi-response-time')
        expect(data).has.ownProperty('delayed_ms')

        const first_response_time = Number(headers['x-pfapi-response-time'].split(' ')[0]);

        const result = await axios.get('http://localhost:3000/random');

        const second_response_time = Number(result.headers['x-pfapi-response-time'].split(' ')[0]);

        expect(first_response_time).to.be.greaterThan(second_response_time);
    });

    it('test composite', async () => {

        const {status, headers, data} = await axios.get('http://localhost:3000/composite');
        //console.log(status, headers, data);
        expect(status).equals(200);
        expect(headers).has.ownProperty('date')
        expect(headers).has.ownProperty('last-modified')
        expect(headers).has.ownProperty('etag')
        expect(headers).has.ownProperty('cache-control');
        expect(headers).has.ownProperty('expires')
        expect(headers).has.ownProperty('x-pfapi-response-time')
        expect(data).has.ownProperty('title');
        expect(data).has.ownProperty('random');
        expect(data).has.ownProperty('simple');

        const first_response_time = Number(headers['x-pfapi-response-time'].split(' ')[0]);

        const result = await axios.get('http://localhost:3000/random');

        const second_response_time = Number(result.headers['x-pfapi-response-time'].split(' ')[0]);

        expect(first_response_time).to.be.greaterThan(second_response_time);
    });

    after(() => {
        kill_script();
    })
});