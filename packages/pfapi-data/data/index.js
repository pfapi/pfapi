'use strict';

const os = require('os');
const fs = require('fs-extra');
const node_path = require('path');
const { unzip } = require('@pfapi/utils');

module.exports = async (strapi) => {

    const tmpdir = node_path.join(os.tmpdir(), 'pfapi-data');
    
    const uid = 'api::world-city.world-city';

    if (!strapi.contentTypes[uid]) {
        strapi.log.warn(`${uid} not found!`);
        return;
    }

    if (await strapi.db.query(uid).count() == 0) {

        strapi.log.info('populating world_cities with data');

        const des_filepath = node_path.join(tmpdir, 'world-cities.json');
        if (fs.existsSync(des_filepath)) {
            await fs.unlinkSync(des_filepath);
        }

        if (!fs.existsSync(tmpdir)) {
            fs.mkdirSync(tmpdir, {recursive: true});
        }

        const src_filepath = node_path.join(__dirname, 'world-cities.json.zip');
        await unzip(src_filepath, tmpdir);

        if (!fs.existsSync(des_filepath)) {
            strapi.log.error(`unzipped file ${des_filepath} not found`);
            return;
        }

        const world_cities = require(des_filepath);
        
        strapi.log.info(`world_cities total: ${world_cities.length}`);

        const batch = 500;
        const entries = [];
        for (let i = 0; i < world_cities.length; i++) {
            entries.push({id: i+1, ...world_cities[i]});
            if (entries.length === batch) {
                await strapi.db.query(uid).createMany({data: entries});
                entries.length = 0;
            }
            if (i % 1000 === 0) process.stdout.write('.');
        }

        if (entries.length > 0) {
            await strapi.db.query(uid).createMany({data: entries});
            entries.length = 0;
            process.stdout.write('.');
        }

        process.stdout.write('\n');

        strapi.log.info('world cities data population done!');

        if (fs.existsSync(tmpdir)) {
            await fs.rm(tmpdir, {recursive: true});
        }
    }

    const handle_uid = 'plugin::pfapi.pfapi-handle';
    const files_uid = 'plugin::upload.file';

    if (!strapi.contentTypes[handle_uid]) return;
    if (await strapi.db.query(handle_uid).count() > 0) return;
    if (await strapi.db.query(files_uid).count() > 0) return;

    const files_path = node_path.join(__dirname, 'files.json');

    const files = require(files_path);

    for (const data of files) {
        await strapi.entityService.create(files_uid, {data});
    }

    strapi.log.info(`added ${files.length} files`);

    const handle_filepath = node_path.join(__dirname, 'handles.json');
    
    const handles = require(handle_filepath);

    for (const data of handles) {
        data.publishedAt = new Date();
        await strapi.entityService.create(handle_uid, {data});
    }

    strapi.log.info(`added ${handles.length} handles`);

    if (fs.existsSync(tmpdir)) {
        await fs.rm(tmpdir, {recursive: true});
    }

    if (strapi.PfapiApp && strapi.PfapiApp.pfapi_uids) {
        setTimeout(async() => {
            await strapi.PfapiApp.pfapi_uids.load_all();
        }, 30000);
    }
}

