'use strict';

const chai = require('chai');

const strapi = require('@strapi/strapi');
const { admin_request, pfapi_request, strapi_app } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-handle-change

describe('Test handle change', () => {
    
    before(async() => {
        await strapi_app.start(strapi);
    });

    it('handle change cache update', async () => {

        for (let loop = 0; loop < 3; loop ++) {

            console.log({loop});

            const url = '/content-manager/collection-types/plugin::pfapi.pfapi-handle/1';

            let saved_params;
            const new_fields = ['id', 'name', 'lat', 'lng', 'population'];

            {
                const {status, data} = await pfapi_request({path: '/northern-cities/2148', ...config});
                expect(status).equals(200);
                if (Object.keys(data.item).length === new_fields.length) {
                    new_fields.push('country');
                }
            }
            {
                const {status, data} = await admin_request({url, ...config});
                expect(status).equals(200);
                saved_params = data.params;
            }
            {
                const new_params = { ...saved_params, fields: new_fields };
                const {status, data} = await admin_request({url, method: 'PUT', body: {params: new_params}, ...config});
                expect(status).equals(200);
                expect(data.params).deep.equals(new_params);
            }
            {
                const new_params = { ...saved_params, fields: new_fields };
                const {status, data} = await admin_request({url});
                expect(status).equals(200);
                expect(data.params).deep.equals(new_params);

                await new Promise(resolve => setTimeout(resolve, 500));
            }
            let ok = false;
            for (let i = 0; i < 10; i++) {
                const {status, data} = await pfapi_request({path: '/northern-cities/2148', ...config});
                expect(status).equals(200);
                //console.log(data.item);
                if (Object.keys(data.item).length === new_fields.length) {
                    ok = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            {
                const {status, data} = await admin_request({url, method: 'PUT', body: {params: saved_params}, ...config});
                expect(status).equals(200);
                expect(data.params).deep.equals(saved_params);
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