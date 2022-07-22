'use strict';

const { Composite, logging } = require('./');
const find_one = require('./find-one');
const run_ejs = require('./run-ejs');

class AggregateOne extends Composite {

    item = find_one;

    transform(data, params) {
        logging.debug('AggregateOne transform', params);
        run_ejs(data);
    }
}

module.exports = new AggregateOne();