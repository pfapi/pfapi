'use strict';

const fs = require('fs');
const node_path = require('path');

/**
 *  specific for strapi running environment
 * 
 * @param {*} full_dirname __dirname
 * @returns strapi project root
 */
module.exports = (full_dirname = __dirname) => {

    if (full_dirname.includes('packages')) {

        const index = full_dirname.indexOf('packages');
        const root = node_path.join(full_dirname.slice(0, index + 8), 'strapi-app');
        if (is_strapi_project_root(root)) {
            return root;
        }

    } else if (full_dirname.includes('node_modules')) {

        const index = full_dirname.indexOf('node_modules');
        const root = full_dirname.slice(0, index - 1);
        if (is_strapi_project_root(root)) {
            return root;
        }
            
    } else if (full_dirname.includes('src')) {

        const index = full_dirname.indexOf('src');
        const root = full_dirname.slice(0, index - 1);
        if (is_strapi_project_root(root)) {
            return root;
        }
            
    }

    throw new Error('failed to find project root directory');
}

function is_strapi_project_root(root) {
    if (!fs.existsSync(node_path.join(root, 'config'))) {
        return false;
    }
    if (!fs.existsSync(node_path.join(root, 'public'))) {
        return false;
    }
    if (!fs.existsSync(node_path.join(root, 'src', 'admin'))) {
        return false;
    }
    if (!fs.existsSync(node_path.join(root, 'src', 'api'))) {
        return false;
    }
    return true;
}