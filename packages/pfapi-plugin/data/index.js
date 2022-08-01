'use strict';

const fs = require('fs-extra');
const node_path = require('path');
const { find_project_root } = require('@pfapi/utils');

module.exports = async () => {

    const root = find_project_root(__dirname);

    const components_path = node_path.join(root, 'src', 'components');

    if (!fs.existsSync(components_path)) {
        fs.mkdirSync(components_path)
    }

    const pfapi_types_path = node_path.join(components_path, 'pfapi-types');
    if (!fs.existsSync(pfapi_types_path)) {
        await fs.copy(node_path.join(__dirname, 'pfapi-types'), pfapi_types_path);
        console.log('installed pfapi-types components');
    }
}