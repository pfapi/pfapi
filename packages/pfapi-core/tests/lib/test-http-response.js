'use strict';

const chai = require('chai');
const HttpResponse = require('../../src/lib/http-response');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-http-response

describe('Test http-response', () => {

    it('test origin', async () => {

        const http_response = new HttpResponse();
        const ctx = { get: (name) => 'http://localhost' };
        const headers = {};
        http_response.handle_origin(ctx, headers);
        //console.log(headers);
        expect(headers).to.deep.equal({
            'Access-Control-Allow-Origin': 'http://localhost',
            'Access-Control-Allow-Credentials': true
        });
    });

    it('test options', async () => {

        const http_response = new HttpResponse();
        const headers = {};
        http_response.handle_options(null, headers);
        //console.log(headers);
        expect(headers).to.deep.equal({
            'Access-Control-Expose-Headers': 'Authorization, Content-Type, Accept, Accept-Language',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept, Accept-Language',
            'Access-Control-Max-Age': 2592000
        });
    });

    it('test if-modified-since', async () => {

        const http_response = new HttpResponse();
        
        const now_ms = Math.round( Date.now() / 1000 ) * 1000;
        const key = 'key';
        const checksum = 'checksum';

        const ctx1 = { request: { header: {'if-modified-since': new Date(now_ms).toGMTString() }}};

        const result1 = http_response.handle_conditional(ctx1, new Date(now_ms), key, checksum, false);
        expect(result1).equals(true)
        expect(ctx1.status).equal(304);

        const ctx2 = { request: { header: {'if-modified-since': new Date(now_ms).toGMTString() }}};
        const result2 = http_response.handle_conditional(ctx2, new Date(now_ms - 60000), key, checksum, false);
        expect(result2).equals(true)
        expect(ctx2.status).equal(304);

        const ctx3 = { request: { header: {'if-modified-since': new Date(now_ms).toGMTString() }}};
        const result3 = http_response.handle_conditional(ctx3, new Date(now_ms + 60000), key, checksum, false);
        expect(result3).equals(false)
        expect(ctx3.status).not.equal(304);
    });

    it('test if-not-match', async () => {

        const http_response = new HttpResponse();
        
        const now_ms = Math.round( Date.now() / 1000 ) * 1000;
        const key = 'key';
        const checksum = 'checksum';

        const ctx1 = { request: { header: {'if-none-match': '"He48ysqxagRo1TUF"' }}};

        const result1 = http_response.handle_conditional(ctx1, new Date(now_ms), key, checksum, false);
        expect(result1).equals(true)
        expect(ctx1.status).equal(304);

        const ctx2 = { request: { header: {'if-none-match': '"AAHe48ysqxagRo1TUF"' }}};
        const result2 = http_response.handle_conditional(ctx2, new Date(now_ms - 60000), key, checksum, false);
        expect(result2).equals(false)
        expect(ctx2.status).not.equal(304);

    });
});