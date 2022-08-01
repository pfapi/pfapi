'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os')
const { execSync } = require('child_process');

module.exports = async (client) => {
    if (client === 'sqlite') {
        console.log('drop sqlite db');
        await drop_sqlite_db();
    }
    if (client === 'mysql') {
        console.log('drop mysql db');
        await drop_mysql_db();
    }
}

async function drop_sqlite_db() {
    const filepath = path.join(process.cwd(), '.tmp', 'data.db');
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
}

async function drop_mysql_db() {
    const filepath = path.join(__dirname, '..', 'files/mylogin.cnf');
    const homedir = os.homedir();
    const target_filepath = path.join(homedir, '.mylogin.cnf');
    if (!fs.existsSync(target_filepath)) {
        execSync(`cp ${filepath} ${target_filepath} ; chmod 600 ${target_filepath}`);
    }
    execSync('mysql --login-path=local -e "drop database if exists pfapi_test"');
}