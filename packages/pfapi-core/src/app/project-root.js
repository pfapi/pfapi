'use strict';

module.exports = {
    set,
    get
};

let project_root_dir;

function set(root_dir) {
    project_root_dir = root_dir;
}

function get() {
    if (project_root_dir) return project_root_dir;
    if (global.strapi) {
        if (global.strapi.dirs.root) { // for strapi before 4.3.0
            project_root_dir = global.strapi.dirs.root;
        } else if (global.strapi.dirs.app?.root) {
            project_root_dir = global.strapi.dirs.app.root;
        } else if (global.strapi.dirs.dist?.root) {
            project_root_dir = global.strapi.dirs.dist.root;
        }
        if (project_root_dir) {
            if (project_root_dir.includes('packages')) {
                const index = project_root_dir.indexOf('packages');
                project_root_dir = project_root_dir.slice(0, index - 1);
            }
            return project_root_dir;
        }
    }
    throw new Error('failed to find project root directory');
}
