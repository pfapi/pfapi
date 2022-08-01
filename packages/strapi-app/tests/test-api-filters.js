'use strict';

const chai = require('chai');

const { pfapi_request } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-api-filters

describe('Test api filters', () => {
   
    it('api filters - sort and limit', async () => {

        const query = {sort: {lat: 'desc', lng: 'asc'}, limit: 1 };
        const {status, data: {title, map, filters, items, pagination, sort}} = await pfapi_request({path: '/northern-cities', query, ...config});
        expect(status).equals(200);
        expect(title).equals('Northern Cities - Total 595');
        expect(map).to.not.be.null;
        expect(items).to.be.an('array');
        expect(items.length).equals(1);
        expect(filters).to.be.an('array');
        expect(filters.length).greaterThan(0);
        expect(pagination).to.deep.equal({ page: 1, pageSize: 1, pageCount: 595, total: 595 });
        expect(sort).to.deep.equal({ lat: 'desc', lng: 'asc' });

    });

    it('api filters - pagination', async () => {

        const query = { pagination: {page: 3, pageSize: 100 }};
        const {status, data: {title, map, filters, items, pagination}} = await pfapi_request({path: '/northern-cities', query, ...config});
        expect(status).equals(200);
        expect(title).equals('Northern Cities - Total 595');
        expect(map).to.not.be.null;
        expect(items).to.be.an('array');
        expect(items.length).equals(100);
        expect(filters).to.be.an('array');
        expect(filters.length).greaterThan(0);
        expect(pagination).to.deep.equal({ page: 3, pageSize: 100, pageCount: 6, total: 595 });

    });

    it('api filters - fields', async () => {

        const query = { fields: ['name']};
        const {status, data: {item}} = await pfapi_request({path: '/world-cities/2148', query, ...config});
        expect(status).equals(200);
        expect(item).to.deep.equal({ id: 2148, name: 'Anchorage' });
    });
});