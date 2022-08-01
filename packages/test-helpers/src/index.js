'use strict';

const config = require('./config');
const drop_db = require('./drop-db');
const prepare_db = require('./prepare-db');
const use_redis_cluster = require('./use-redis-cluster');
const config_nginx = require('./config-nginx');

module.exports = {
    config,
    drop_db,
    prepare_db,
    use_redis_cluster,
    config_nginx
}