'use strict';

const chai = require('chai');

const { admin_request, pfapi_request } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-key-change

describe('Test key change', () => {

    it('api key change', async () => {

        const url = '/content-manager/collection-types/plugin::pfapi.pfapi-key/1';
        const new_key = 'changed-api-key-' + Date.now();
        let saved_key;

        {
            const {status, data} = await admin_request({url, ...config});
            expect(status).equals(200);
            saved_key = data.key;
        }
        {
            const {status} = await pfapi_request({path: '/world-cities/1', ...config});
            expect(status).equals(200);
        }
        {
            const {status, data} = await admin_request({url, method: 'PUT', body: {key: new_key}, ...config});
            expect(status).equals(200);
            expect(data.key).equals(new_key)

            await new Promise(resolve => setTimeout(resolve, 500));
        }
        let ok = false;
        for (let i = 0; i < 10; i++) {
            const {status} = await pfapi_request({path: '/world-cities/1', ...config});
            if (status === 401) {
                ok = true;
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        let status;
        {
            const result = await pfapi_request({path: '/world-cities/1', key: new_key, ...config});
            status = result.status;
        }
        {
            const {status, data} = await admin_request({url, method: 'PUT', body: {key: saved_key}, ...config});
            expect(status).equals(200);
            expect(data.key).equals(saved_key)
        }
        expect(ok).is.true;
        expect(status).equals(200);
    });

});