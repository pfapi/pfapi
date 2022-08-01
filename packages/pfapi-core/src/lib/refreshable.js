'use strict';

const node_path = require('path');
const fs = require('fs');
const project_root = require('../app/project-root');

class Refreshable {

    /**
     * There are 2 ways to instantiate Refreshable:
     * 
     * 1) make a NewClassName extends from Refreshable, instantiate it as
     *      module.exports = new NewClassName(__filename) 
     *    at bottom of the 
     * 
     * 2) new Refreshable directly with relative path pointed to the extended class, 
     *    the relative path is related from project_root_dir
     * 
     * @param {*} filepath __filename or relative path from project_root_dir
     */
    constructor(filepath) {
        const project_root_dir = project_root.get();
        if (this.constructor.name === 'Refreshable') {   // relative path
            const full_path = node_path.join(project_root_dir, filepath);
            if (!fs.existsSync(full_path)) {
                throw new Error(`${this.constructor.name}, failed to find project root! filepath: ${filepath}, project root: ${project_root_dir}, full_path: ${full_path}`);
            }
            this.module_path = filepath;
            this.module = require(full_path);
        } else {                                         // __filename
            this.module_path = filepath.slice(project_root_dir.length);
            if (!filepath.startsWith(project_root_dir) || !fs.existsSync(filepath)) {
                throw new Error(`${this.constructor.name}, failed to find project root! filepath ${filepath}, project root: ${project_root_dir}, module path: ${this.module_path}`);
            }
        }
    }

    /**
     * the returned result:
     * 
     * 1) it is the params in Cacheable, saved in cache as key info, for refresh purpose
     * 2) cache key is generated from { params, module_path }
     * 
     * For improving cache efficiency and reducing calls to generate caches,
     * it provides mechanism to remove frequently changing but not used properties.
     * 
     * For example: 
     * 
     *  for http requests, params has properties:
     *      filters, ..., pagination
     *  those values are used to generate the cache key
     * 
     *  if the refreshable is just to get total, by removing pagination,
     *  the value change of page and pageSize will not make a new cache key,
     *  so it reduces unnecessary caches and calls to generate the caches
     * 
     * @param {*} params data from query string and path params
     */
    reduce(params) {
        return params;
    }

    /**
     * get_data calls get_data of the module
     * 
     * @param {*} params 
     *
     * 1) without config (handle), params is the result of reduce method
     * 2) with config (handle), it is a merged of reduced params and params in config
     * 
     * @returns an object with data, content_type and dependencies fields
     */
    async get_data(params) {
        if (this.module) {
            return await this.module.get_data(params);
        }
        throw new Error('Refreshable, get_data not implemented yet!');
    }

}

module.exports = Refreshable;