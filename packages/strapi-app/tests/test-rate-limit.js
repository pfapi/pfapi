'use strict';

const chai = require('chai');

const { admin_request, pfapi_request, get_random_ip } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/test-rate-limit

describe('Test rate-limits', () => {

    it('rate-limits', async () => {

        await new Promise(resolve => setTimeout(resolve, 1000));

        const url = '/content-manager/collection-types/plugin::pfapi.pfapi-rate-limit';
        const ip = get_random_ip();
        console.log('X-Forwarded-For', ip);

        {
            const {status} = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            expect(status).equals(200);
        }
        let id;
        {
            const body = { 
                ip_mask: '255.255.255.255', 
                prefix: null, 
                window_secs: 10, 
                max_count: 10, 
                block_secs: 100, 
                comment: 'test rate limit'
            }
            const {status, data} = await admin_request({url, method: 'POST', body, ...config});
            expect(status).equals(200);
            id = data.id;

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        let i = 0, status;
        for (; i < 20; i++) {
            const result = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            status = result.status;
            if (status === 429) {
                console.log('calls', i);
                break;
            }
            if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 200));
        }
        {
            const {status} = await admin_request({url: `${url}/${id}`, method: 'DELETE', ...config});
            expect(status).equals(200);
        }
        expect(status).equals(429);
    });

    it('rate-limits with prefix', async () => {

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const url = '/content-manager/collection-types/plugin::pfapi.pfapi-rate-limit';
        const ip = get_random_ip();
        console.log('X-Forwarded-For', ip);

        {
            const {status} = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            expect(status).equals(200);
        }
        let id;
        {
            const body = { 
                ip_mask: '255.255.255.255', 
                prefix: '/pfapi/world-cities', 
                window_secs: 10, 
                max_count: 10, 
                block_secs: 100, 
                comment: 'test rate limit'
            }
            const {status, data} = await admin_request({url, method: 'POST', body, ...config});
            expect(status).equals(200);
            id = data.id;

            await new Promise(resolve => setTimeout(resolve, 500));
        }
        let i = 0, status1, status2;
        for (; i < 20; i++) {
            const result = await pfapi_request({path: '/world-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            status1 = result.status;
            if (status1 === 429) {
                console.log('calls', i);
                break;
            }
            if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 200));
        }
        i = 0;
        for (; i < 20; i++) {
            const result = await pfapi_request({path: '/northern-cities/2148', headers: {'X-Forwarded-For': ip}, ...config});
            status2 = result.status;
            if (status2 === 429) {
                console.log('calls', i);
                break;
            }
            if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 200));
        }
        {
            const {status} = await admin_request({url: `${url}/${id}`, method: 'DELETE', ...config});
            expect(status).equals(200);

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        expect(status1).equals(429);
        expect(status2).equals(200);
    });
});