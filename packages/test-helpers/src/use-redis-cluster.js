'use strict';

const fs = require('fs-extra');

module.exports = () => {
    const env_path = path.join(process.cwd(), '.env');
    const redis_env_path = path.join(__dirname, '..', 'files/redis-env');
    fs.copy(redis_env_path, env_path);
}