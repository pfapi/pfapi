'use strict';

const chai = require('chai');
const get_value = require('../../src/utils/get-value');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec tests/utils/test-get-value

describe('Test get-value', () => {

    it('undefined', async () => {
        try {
            get_value(undefined);
            assert(false, 'failed, should not get to here');
        } catch(err) {
            expect(err.message).equals('value is undefined');
        }
    });

    it('null', async () => {
        const value = get_value('null');
        //console.log(value);
        expect(value).equals(null);
    });

    it('string', async () => {
        const value = get_value('string');
        //console.log(value);
        expect(value).equals('string');
    });

    it('buffer', async () => {
        const value = get_value(Buffer.from('string', 'utf-8'));
        //console.log(value);
        expect(value).equals('string');
    });

    it('number', async () => {
        const value = get_value('1');
        //console.log(value);
        expect(value).equals(1);
    });

    it('decimal', async () => {
        const value = get_value('1.23');
        //console.log(value);
        expect(value).equals(1.23);
    });

    it('object', async () => {
        const value = get_value('{"x":1}');
        //console.log(value);
        expect(value).to.deep.equal({x: 1});
    });

    it('array', async () => {
        const value = get_value('[1]');
        //console.log(value);
        expect(value).to.deep.equal([1]);
    });
});