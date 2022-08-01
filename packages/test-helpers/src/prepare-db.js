'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os')
const { unzip } = require('@pfapi/utils');
const { exec, execSync } = require('child_process');

module.exports = async (client) => {
    if (client === 'sqlite') {
        console.log('create sqlite db');
        await create_sqlite_db();
    }
    if (client === 'mysql') {
        console.log('create mysql db');
        await create_mysql_db();
    }
}

async function create_sqlite_db() {
    const db_config_path = path.join(process.cwd(), 'config/database.js');
    const sqlite_file_path = path.join(__dirname, '..', 'files/db-sqlite.js');
    await fs.copy(sqlite_file_path, db_config_path);
    const data_db_path = path.join(process.cwd(), '.tmp/data.db');
    if (fs.existsSync(data_db_path)) {
        return;
    }
    const src_filepath = path.join(__dirname, '..', 'files/data.db.zip');
    const dst_filepath = path.join(process.cwd(), '.tmp');
    if (!fs.existsSync(dst_filepath)) {
        fs.mkdirSync(dst_filepath, {recursive: true});
    }
    await unzip(src_filepath, dst_filepath);
}

async function create_mysql_db() {
    const db_config_path = path.join(process.cwd(), 'config/database.js');
    const mysql_file_path = path.join(__dirname, '..', 'files/db-mysql.js');
    await fs.copy(mysql_file_path, db_config_path);
    const filepath = path.join(__dirname, '..', 'files/mylogin.cnf');
    const homedir = os.homedir();
    const target_filepath = path.join(homedir, '.mylogin.cnf');
    if (!fs.existsSync(target_filepath)) {
        execSync(`cp ${filepath} ${target_filepath} ; chmod 600 ${target_filepath}`);
    }
    if (await check_for_pfapi_test()) {
        return;
    }
    await import_pfapi_test();
}

async function import_pfapi_test() {
    await unzip(path.join(__dirname, '..', 'files/mysql.sql.zip'), require('os').tmpdir());
    const sql_path = path.join(require('os').tmpdir(), 'mysql.sql')
    execSync(`mysql --login-path=local < ${sql_path}`);
}

async function check_for_pfapi_test() {
    return new Promise((resolve) => {
        exec('mysql --login-path=local -e "show databases"', (error, stdout, stderr) => {
            if (stdout){
                resolve(stdout.includes('pfapi_test'));
            }
            if (error || stderr){
                console.error(error || stderr);
                resolve(false);
            }
        })
    });
}