'use strict';

const chai = require('chai');

const strapi = require('@strapi/strapi');
const { pfapi_request, strapi_app } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-merge-filters

describe('Test merge filters', () => {
    
    before(async() => {
        await strapi_app.start(strapi);
    });
   
    it('merge_filters=1', async () => {

        await new Promise(resolve => setTimeout(resolve, 1000));

        const query = { filters: { iso3: 'USA' }, merge_filters: 1 };
        const {status, data} = await pfapi_request({path: '/northern-cities', query, ...config});
        expect(status).equals(200);
        expect(data.title).equals('Northern Cities - Total 19');
        expect(data.filters[3].items).to.deep.equal([ { value: 'United States', count: 19, label: 'United States' } ]);
        expect(data.pagination).to.deep.equal({ page: 1, pageSize: 20, pageCount: 1, total: 19 });
    });

    it('merge_filters=1 with ss_rand=1', async () => {

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const query = { filters: { iso3: 'USA' }, merge_filters: 1, ss_rand: 1 };
        const {status, data} = await pfapi_request({path: '/northern-cities', query, ...config});
        expect(status).equals(200);
        expect(data.title).equals('Northern Cities - Total 19');
        expect(data.filters[3].items).to.deep.equal([ { value: 'United States', count: 19, label: 'United States' } ]);
        expect(data.pagination).to.deep.equal({ page: 1, pageSize: 20, pageCount: 1, total: 19 });
    });

    after(async() => {
        await strapi_app.stop();
    });
});