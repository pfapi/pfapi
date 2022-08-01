'use strict';

const fs = require('fs-extra');
const { find_project_root, unzip } = require('@pfapi/utils');
const node_path = require('path');

(async () => {

    const root = find_project_root(__dirname);

    if (!root) return;

    const world_city_path = node_path.join(root, 'src', 'api', 'world-city');

    if (!fs.existsSync(world_city_path)) {
        await fs.copy(node_path.join(__dirname, 'world-city'), world_city_path);
        console.log('installed world-city api');
    }

    const uploads_pfapi_path = node_path.join(root, 'public', 'uploads', 'pfapi');

    if (!fs.existsSync(uploads_pfapi_path)) {
        const uploads_path = node_path.join(root, 'public', 'uploads');
        if (!fs.existsSync(uploads_path)) {
            fs.mkdirSync(uploads_path, {recursive: true});
        }
        const src_filepath = node_path.join(__dirname, 'pfapi.zip');
        await unzip(src_filepath, uploads_path);
        console.log('installed pfapi files');
    }
})();