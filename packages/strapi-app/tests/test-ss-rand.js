'use strict';

const chai = require('chai');

const { pfapi_request } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-ss-rand

describe('Test ss_rand=1', () => {

    it('ss_rand=1', async () => {

        const query = { ss_rand: 1 };
        const {status, headers, data} = await pfapi_request({path: '/northern-cities', query, ...config});
        expect(status).equals(200);
        expect(headers['cache-control']).equals('max-age=0, no-store, must-revalidate');
        expect(headers.date).equals(headers.expires)
        expect(data.title).equals('Northern Cities - Total 595');
        expect(data.map).to.not.be.null;
        expect(data.items).to.be.an('array');
        expect(data.items.length).equals(20);
        expect(data.filters).to.be.an('array');
        expect(data.filters.length).greaterThan(0);
        expect(data.pagination).to.deep.equal({ page: 1, pageSize: 20, pageCount: 30, total: 595 });
    });

});