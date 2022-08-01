'use strict';

const Composite = require('../../src/lib/composite');

const random = require('./random-refreshable');
const simple = require('./simple-refreshable');

class SimpleComposite extends Composite {

    title = 'Simple Composite';
    
    random = random;

    simple = simple;
}

module.exports = new SimpleComposite();