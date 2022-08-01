'use strict';

const chai = require('chai');

const { admin_request, pfapi_request } = require('@pfapi/utils');
const { config } = require('@pfapi/test-helpers');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 3000 --reporter spec tests/test-handle-preview

describe('Test handle preview', () => {

    it('handle preview', async () => {

        const url = '/content-manager/collection-types/plugin::pfapi.pfapi-handle/1';

        {
            const {status, data} = await admin_request({url, ...config});
            expect(status).equals(200);
            if (data.publishedAt) {
                const {status, data} = await admin_request({url: url + '/actions/unpublish', method: 'POST', body: {publishedAt: null, updatedAt: new Date()}, ...config});
                expect(status).equals(200);
                expect(data.publishedAt).is.null;

                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        let ok = false;
        for (let i = 0; i < 10; i++) {
            const query = { preview: 1 };
            const {status, headers, data} = await pfapi_request({path: '/northern-cities', query, ...config});
            if (status === 200) {
                ok = true;
                expect(headers['cache-control']).equals('max-age=0, no-store, must-revalidate');
                expect(headers.date).equals(headers.expires)
                expect(data.title).equals('Northern Cities - Total 595');
                expect(data.map).to.not.be.null;
                expect(data.items).to.be.an('array');
                expect(data.items.length).equals(20);
                expect(data.filters).to.be.an('array');
                expect(data.filters.length).greaterThan(0);
                expect(data.pagination).to.deep.equal({ page: 1, pageSize: 20, pageCount: 30, total: 595 });
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        expect(ok).is.true;
        {
            const {status, data} = await admin_request({url: '/content-manager/collection-types/plugin::pfapi.pfapi-key/1', 
                method: 'PUT', body: {allow_preview: false}, ...config});
            expect(status).equals(200);
            expect(data.allow_preview).is.false;
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        let status;
        for (let i = 0; i < 10; i++) {
            const query = { preview: 1 };
            const result = await pfapi_request({path: '/northern-cities', query, ...config});
            status = result.status;
            if (status === 401) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        let result;
        {
            result = await admin_request({url: '/content-manager/collection-types/plugin::pfapi.pfapi-key/1', method: 'PUT', body: {allow_preview: true}, ...config});
        }
        {
            const {status, data} = await admin_request({url: url + '/actions/publish', method: 'POST', body: {publishedAt: new Date, updatedAt: new Date()}, ...config});
            expect(status).equals(200);
            expect(data.publishedAt).is.not.null;
        }
        expect(status).equals(401);
        expect(result.status).equals(200);
        expect(result.data.allow_preview).is.true;
    });

});