'use strict';

const chai = require('chai');

const strapi = require('@strapi/strapi');
const { api_request, pfapi_request, strapi_app } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-data-change

describe('Test data change', () => {
    
    before(async() => {
        await strapi_app.start(strapi);
    });

    it('data change cache eviction', async () => {

        for (let loop = 0; loop < 3; loop++) {

            console.log({loop});

            let saved_population;
            const new_population = 288000 + Math.round(1000 * Math.random());

            {
                const {status, data: { item }} = await pfapi_request({path: '/world-cities/2148', ...config});
                expect(status).equals(200);
                saved_population = item.population;
            }
            {
                const {status, data: {data: {attributes}}} = await api_request({path: '/world-cities/2148', method: 'PUT', body: {data: {population: new_population}}, ...config});
                expect(status).equals(200);
                expect(attributes.population).equals(new_population);
            }
            {
                const {status, data: {data: {attributes}}} = await api_request({path: '/world-cities/2148', ...config});
                expect(status).equals(200);
                expect(attributes.population).equals(new_population);

                await new Promise(resolve => setTimeout(resolve, 500));
            }
            let ok = false;
            for (let i = 0; i < 10; i++) {
                const {status, data: { item }} = await pfapi_request({path: '/world-cities/2148', ...config});
                expect(status).equals(200);
                if (item.population === new_population) {
                    ok = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            {
                const {status, data: {data: {attributes}}} = await api_request({path: '/world-cities/2148', method: 'PUT', body: {data: {population: saved_population}}, ...config});
                expect(status).equals(200);
                expect(attributes.population).equals(saved_population);
            }
            if (ok) break;
            else {
                if (loop !== 2) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
            }
            expect(ok).is.true;
        }
    });

    it('data delete cache eviction', async () => {

        for (let loop = 0; loop < 3; loop++) {

            console.log({loop});

            let saved_item, saved_count;
            {
                const {status, data} = await pfapi_request({path: '/get-count/northern-cities', ...config});
                expect(status).equals(200);
                saved_count = data;
            }

            {
                const {status, data: { item }} = await pfapi_request({path: '/world-cities/2148', ...config});
                expect(status).equals(200);
                saved_item = item;
                delete saved_item.createdAt;
                delete saved_item.updatedAt;
            }

            {
                const {status, data} = await api_request({path: '/world-cities/2148', method: 'DELETE', ...config});
                expect(status).equals(200);

                await new Promise(resolve => setTimeout(resolve, 500));
            }
            let ok = false;
            for (let i = 0; i < 10; i++) {
                const {status, data} = await pfapi_request({path: '/get-count/northern-cities', ...config});
                expect(status).equals(200);
                if (data === saved_count -1) {
                    ok = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            {
                const {status, data} = await api_request({path: '/world-cities', method: 'POST', body: {data: saved_item}, ...config});
                expect(status).equals(200);
            }
            if (ok) break;
            else {
                if (loop !== 2) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
            }
            expect(ok).is.true;
        }
    });

    after(async() => {
        await strapi_app.stop();
    });
});