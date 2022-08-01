'use strict';

const path = require('path');
const { execSync } = require('child_process');

module.exports = () => {
    const nginx_config_path = path.join(__dirname, '..', 'files/nginx.conf');
    execSync(`sudo cp ${nginx_config_path} /etc/nginx/nginx.conf`)
}