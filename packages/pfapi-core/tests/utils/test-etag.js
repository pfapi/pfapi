'use strict';

const chai = require('chai');
const { get_etag, parse_etag } = require('../../src/utils/etag');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec tests/utils/test-etag

describe('Test etag', () => {

    it('simple', async () => {

        const cacheable = {key: 'key', checksum: 'checksum'};
        const etag = get_etag(cacheable);
        //console.log(etag);

        const etag_info = parse_etag(etag);
        //console.log(etag_info);
        expect(etag_info).to.deep.equal(cacheable);
    });

});