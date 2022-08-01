'use strict';

const chai = require('chai');

const { api_request, pfapi_request, admin_request } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-requests

describe('Test requests', () => {

    it('api_request detail view', async () => {
        const {status, headers, data: { data }} = await api_request({path: '/world-cities/1', ...config});
        expect(status).equals(200);
        expect(headers['x-response-time']).to.not.be.null;
        expect(data.id).equals(1);
        expect(data.attributes.name).equals('Tokyo');
    });

    it('api_request list view', async () => {
        const {status, headers, data: { data }} = await api_request({path: '/world-cities', ...config});
        expect(status).equals(200);
        expect(headers['x-response-time']).to.not.be.null;
        expect(data).to.be.an('array');
        expect(data.length).greaterThan(0);
    });

    it('pfapi_request detail view', async () => {
        const {status, headers, data: { item }} = await pfapi_request({path: '/world-cities/1', ...config});
        expect(status).equals(200);
        expect(headers['x-response-time']).to.not.be.null;
        expect(headers['x-pfapi-response-time']).to.not.be.null;
        expect(item.id).equals(1);
        expect(item.name).equals('Tokyo');
    });

    it('pfapi_request list view', async () => {
        const {status, headers, data: { filters, items, pagination }} = await pfapi_request({path: '/world-cities', ...config});
        expect(status).equals(200);
        expect(headers['x-response-time']).to.not.be.null;
        expect(headers['x-pfapi-response-time']).to.not.be.null;
        expect(items).to.be.an('array');
        expect(items.length).greaterThan(0);
        expect(filters).to.be.an('array');
        expect(filters.length).greaterThan(0);
        expect(pagination.page).equals(1);
        expect(pagination.pageSize).equals(20);
        expect(pagination.pageCount).equals(2146);
        expect(pagination.total).equals(42905);
    });

    it('admin_request get and change api_key name', async () => {
        const url = '/content-manager/collection-types/plugin::pfapi.pfapi-key/1';
        let saved_name;
        const new_name = 'new-name-' + Date.now();
        {
            const { status, data } = await admin_request({url, ...config});
            expect(status).equals(200);
            expect(data.id).equals(1);
            saved_name = data.name;
        }
        {
            const { status, data } = await admin_request({url, method: 'PUT',  body: {name: new_name}, ...config});
            expect(status).equals(200);
            expect(data.id).equals(1);
            expect(data.name).equals(new_name);
        }
        {
            const { status, data } = await admin_request({url, method: 'PUT',  body: {name: saved_name}, ...config});
            expect(status).equals(200);
            expect(data.id).equals(1);
            expect(data.name).equals(saved_name);
        }
    });
});