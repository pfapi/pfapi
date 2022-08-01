'use strict';

const chai = require('chai');

const refreshable = require('../helpers/simple-refreshable');
const Refreshable = require('../../src/lib/refreshable');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-refreshable

describe('Test refreshable', () => {
   
    it('direct call', async () => {

        const data = await refreshable.get_data({delay_ms: 3});
        //console.log(data)
        expect(data).to.deep.equal({
            data: { delayed_ms: 3 },
            content_type: 'application/json'
          });

    });

    it('from module_path', async () => {

        const module_refreshable = new Refreshable('/tests/helpers/simple-refreshable.js')
        const data = await module_refreshable.get_data({delay_ms: 5});
        //console.log(data)
        expect(data).to.deep.equal({
            data: { delayed_ms: 5 },
            content_type: 'application/json'
          });
 
    });
});