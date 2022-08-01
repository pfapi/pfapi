'use strict';

const chai = require('chai');

const strapi = require('@strapi/strapi');
const { pfapi_request, strapi_app } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-group-by

describe('Test groupBy', () => {
    
    before(async() => {
        await strapi_app.start(strapi);
    });
   
    it('groupBy=iso3', async () => {

        const query = { groupBy: 'iso3', sort: {population: 'desc'} };
        const {status, data} = await pfapi_request({path: '/northern-cities', query, ...config});
        expect(status).equals(200);
        expect(data.title).equals('Northern Cities - Total 11');
        expect(data.map).to.not.be.null;
        expect(data.items).to.be.an('array');
        expect(data.items.length).equals(11);
        expect(data.filters).to.be.an('array');
        expect(data.filters.length).greaterThan(0);
        expect(data.pagination).to.deep.equal({ page: 1, pageSize: 20, pageCount: 1, total: 11 });
    });

    after(async() => {
        await strapi_app.stop();
    });
});