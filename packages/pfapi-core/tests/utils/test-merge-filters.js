'use strict';

const chai = require('chai');
const merge_filters = require('../../src/utils/merge-filters');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec tests/utils/test-merge-filters

describe('Test merge-filters', () => {

    it('empty', async () => {

        const result = merge_filters();
        //console.log(result);
        expect(result).equals(undefined);
        
    });

    it('undefined undefined', async () => {

        const result = merge_filters(undefined, undefined);
        //console.log(result);
        expect(result).equals(undefined);
        
    });

    it('object undefined', async () => {

        const result = merge_filters({x: 1, y: 1}, undefined);
        //console.log(result);
        expect(result).to.deep.equal({$and: [{x: 1}, {y: 1}]});
        
    });

    it('object object', async () => {

        const result = merge_filters({x: {$gt: 1}, y: 1}, {x: 4, y: 1});
        //console.log(result);
        expect(result).to.deep.equal({$and: [{x: {$gt: 1}}, {y: 1}, {x: 4}]});
        
    });

    it('$and object', async () => {

        const result = merge_filters({$and: [{x: {$gt: 1}}, {y: 1}, {x: 4}]}, {x: 4, y: 1});
        //console.log(result);
        expect(result).to.deep.equal({$and: [{x: {$gt: 1}}, {y: 1}, {x: 4}]});
        
    });
});