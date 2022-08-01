'use strict';

const fs = require('fs-extra');
const path = require('path');
const config_nginx = require('./config-nginx');

// use nginx, mysql and redis cluster

module.exports = (env_file = 'my-plus-env') => {
    const env_path = path.join(process.cwd(), '.env');
    const plus_env_path = path.join(__dirname, '..', `files/${env_file}`);
    fs.copy(plus_env_path, env_path);
    config_nginx();
}