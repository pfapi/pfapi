'use strict';

const chai = require('chai');
const get_start_limit = require('../../src/utils/get-start-limit');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec tests/utils/test-get-start-limit

describe('Test get-start-limit', () => {

    it('empty', async () => {
        const start_limit = get_start_limit();
        //console.log( start_limit);
        expect( start_limit).to.deep.equal({start: 0, limit: 20});
    });

    it('string start', async () => {
        const  start_limit = get_start_limit({start: '20'});
        //console.log(start_limit);
        expect(start_limit).to.deep.equal({start: 20, limit: 20});
    });

    it('string limit', async () => {
        const  start_limit = get_start_limit({limit: '10'});
        //console.log(start_limit);
        expect(start_limit).to.deep.equal({start: 0, limit: 10});
    });

    it('pagination pageSize', async () => {
        const  start_limit = get_start_limit({pagination: {pageSize: '10'}});
        //console.log(start_limit);
        expect(start_limit).to.deep.equal({start: 0, limit: 10});
    });

    it('pagination page', async () => {
        const  start_limit = get_start_limit({pagination: {page: '2', pageSize: '10'}});
        //console.log(start_limit);
        expect(start_limit).to.deep.equal({start: 10, limit: 10});
    });
});