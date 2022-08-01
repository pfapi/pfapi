'use strict';

const chai = require('chai');

const Cacheable = require('../../src/lib/cacheable');
const refreshable = require('../helpers/simple-refreshable');

const expect = chai.expect;

// NODE_ENV=test mocha --timeout 30000 --reporter spec tests/lib/test-cacheable-1

describe('Test cacheable-1', () => {
   
    it('simple checks', async () => {

        const delay_ms = 100;

        const cacheable = new Cacheable({params: {delay_ms}, refreshable});
        
        //console.log(cacheable);

        expect(cacheable).to.have.property('refreshable');
        expect(cacheable).to.have.property('config');
        expect(cacheable.module_path).equal('/tests/helpers/simple-refreshable.js')
        expect(cacheable.params).to.deep.equal({ delay_ms })
        expect(cacheable.key).equals('tDQq4XCrzV4s457qys06YYaMvLf');

        expect(cacheable).to.not.have.property('data');
        expect(cacheable).to.not.have.property('timestamp');
        expect(cacheable).to.not.have.property('created_time');
        expect(cacheable).to.not.have.property('modified_time');
        expect(cacheable).to.not.have.property('content_type');
        expect(cacheable).to.not.have.property('ttl');

        const result = await cacheable.get();

        //console.log(cacheable);

        expect(result).equals(true);

        const plain_object = cacheable.plain_object;
        //console.log(plain_object);
        expect(plain_object.data).to.deep.equal({delayed_ms: delay_ms});
        expect(plain_object.duration).greaterThanOrEqual(delay_ms);
        expect(plain_object.checksum).equals('1YJzMN1rmrgDx3JhGK0VwoAfKLQ');

        expect(plain_object).to.have.property('timestamp');
        expect(plain_object).to.have.property('created_time');
        expect(plain_object).to.have.property('modified_time');
        expect(plain_object).to.have.property('content_type');
        expect(plain_object).to.have.property('ttl');
    });

});