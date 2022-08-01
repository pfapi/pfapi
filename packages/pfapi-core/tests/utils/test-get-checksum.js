'use strict';

const chai = require('chai');
const get_checksum = require('../../src/utils/get-checksum');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec tests/utils/test-get-checksum

describe('Test get-checksum', () => {

    it('simple', async () => {

        const checksum = get_checksum('aaa');
        //console.log(checksum);
        expect(checksum).equals('hZTpfAvsuMW9hD1QbP7GStfUrU9');
    });

});