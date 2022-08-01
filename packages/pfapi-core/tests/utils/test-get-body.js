'use strict';

const chai = require('chai');
const get_body = require('../../src/utils/get-body');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec tests/utils/test-get-body

describe('Test get-body', () => {

    it('undefined', async () => {
        try {
            get_body(undefined);
            assert(false, 'failed, should not get to here');
        } catch(err) {
            expect(err.message).equals('data is undefined');
        }
    });

    it('null', async () => {
        const body = get_body(null);
        //console.log(body);
        expect(body).equals('null');
    });

    it('string', async () => {
        const body = get_body('string');
        //console.log(body);
        expect(body).equals('string');
    });

    it('buffer', async () => {
        const body = get_body(Buffer.from('string', 'utf-8'));
        //console.log(body);
        expect(body).equals('string');
    });

    it('number', async () => {
        const body = get_body(1);
        //console.log(body);
        expect(body).equals('1');
    });

    it('decimal', async () => {
        const body = get_body(1.23);
        //console.log(body);
        expect(body).equals('1.23');
    });

    it('object', async () => {
        const body = get_body({x: 1});
        //console.log(body);
        expect(body).equals('{"x":1}');
    });

    it('array', async () => {
        const body = get_body([1]);
        //console.log(body);
        expect(body).equals('[1]');
    });
});