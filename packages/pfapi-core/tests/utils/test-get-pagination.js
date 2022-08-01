'use strict';

const chai = require('chai');
const get_pagination = require('../../src/utils/get-pagination');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec tests/utils/test-get-pagination

describe('Test get-pagination', () => {

    it('empty', async () => {
        const pagination = get_pagination();
        //console.log(pagination);
        // without total, so only page and pageSize included
        expect(pagination).to.deep.equal({ page: 1, pageSize: 20 });
    });

    it('with total', async () => {
        const pagination = get_pagination({total: 100});
        //console.log(pagination);
        expect(pagination).to.deep.equal({ page: 1, pageSize: 20, pageCount: 5, total: 100 });
    });

    it('string', async () => {
        const pagination = get_pagination({start: '1', limit: '10', total: 101});
        //console.log(pagination);
        expect(pagination).to.deep.equal({ total: 101, pageSize: 10, page: 1, pageCount: 11 });
    });
});