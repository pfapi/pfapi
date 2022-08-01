'use strict';

const config = require('./config');
const drop_db = require('./drop-db');
const prepare_db = require('./prepare-db');
const use_plus_env = require('./use-plus-env');
const config_nginx = require('./config-nginx');

module.exports = {
    config,
    drop_db,
    prepare_db,
    use_plus_env,
    config_nginx
}