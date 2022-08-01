'use strict';

const config = require('./config');
const prepare_db = require('./prepare-db');
const use_redis_cluster = require('./use-redis-cluster');
const config_nginx = require('./config-nginx');

module.exports = {
    config,
    prepare_db,
    use_redis_cluster,
    config_nginx
}