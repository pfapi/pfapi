'use strict';

const chai = require('chai');

const strapi = require('@strapi/strapi');
const { pfapi_request, strapi_app } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-routes-by-name

describe('Test routes by name', () => {
    
    before(async() => {
        await strapi_app.start(strapi);
    });

    it('get-count', async () => {

        const {status, data} = await pfapi_request({path: '/get-count/northern-cities', ...config});
        expect(status).equals(200);
        expect(data).equals(595);
    });

    it('find-one', async () => {

        const {status, data} = await pfapi_request({path: '/find-one/northern-cities/2148', ...config});
        expect(status).equals(200);
        expect(data.id).equals(2148);
    });

    it('find-many', async () => {

        const {status, data} = await pfapi_request({path: '/find-many/northern-cities', ...config});
        expect(status).equals(200);
        expect(data).to.be.an('array');
        expect(data.length).greaterThan(0);
    });

    it('get-filters', async () => {

        const {status, data} = await pfapi_request({path: '/get-filters/northern-cities', ...config});
        expect(status).equals(200);
        expect(data).to.be.an('array');
        expect(data.length).greaterThan(0);
    });

    after(async() => {
        await strapi_app.stop();
    });
});