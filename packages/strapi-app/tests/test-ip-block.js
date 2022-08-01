'use strict';

const chai = require('chai');

const strapi = require('@strapi/strapi');
const { admin_request, pfapi_request, get_random_ip, strapi_app } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-ip-block

describe('Test ip block', () => {
    
    before(async() => {
        await strapi_app.start(strapi);
    });

    it('ip block', async () => {

        const url = '/content-manager/collection-types/plugin::pfapi.pfapi-ip';
        const ip = get_random_ip();
        console.log('X-Forwarded-For', ip);

        {
            const {status} = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            expect(status).equals(200);
        }
        let id;
        {
            const body = { 
                name: 'test-ip-blocking', 
                ip_prefix_list: [ { 
                    __component: 'pfapi-types.ip-prefix', 
                    ip_cidr: `${ip}/32`, 
                    prefix: null, 
                    status: 'blocked', 
                    comment: 'test-ip-block' 
                } ]
            }
            const {status, data} = await admin_request({url, method: 'POST', body, ...config});
            expect(status).equals(200);
            id = data.id;

            await new Promise(resolve => setTimeout(resolve, 500));
        }
        let status;
        for (let i = 0; i < 10; i++) {
            const result = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            status = result.status;
            if (status === 403) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        {
            const {status, data} = await admin_request({url: `${url}/${id}`, method: 'DELETE', ...config});
            expect(status).equals(200);
        }
        expect(status).equals(403);
    });

    it('ip block with prefix', async () => {

        const url = '/content-manager/collection-types/plugin::pfapi.pfapi-ip';
        const ip = get_random_ip();
        console.log('X-Forwarded-For', ip);

        {
            const {status} = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            expect(status).equals(200);
        }
        let id;
        {
            const body = { 
                name: 'test-ip-blocking', 
                ip_prefix_list: [ { 
                    __component: 'pfapi-types.ip-prefix', 
                    ip_cidr: `${ip}/32`, 
                    prefix: '/pfapi/world-cities', 
                    status: 'blocked', 
                    comment: 'test-ip-block' 
                } ]
            }
            const {status, data} = await admin_request({url, method: 'POST', body, ...config});
            expect(status).equals(200);
            id = data.id;

            await new Promise(resolve => setTimeout(resolve, 500));
        }
        let status;
        for (let i = 0; i < 10; i++) {
            const result = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            status = result.status;
            if (status === 403) {
                break;
            }
        }
        {
            const {status} = await pfapi_request({path: '/northern-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            expect(status).equals(200);
        }
        {
            const {status, data} = await admin_request({url: `${url}/${id}`, method: 'DELETE', ...config});
            expect(status).equals(200);
        }
        expect(status).equals(403);
    });

    after(async() => {
        await strapi_app.stop();
    });
});