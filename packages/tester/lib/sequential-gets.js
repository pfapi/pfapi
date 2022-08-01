'use strict';

const get_request = require('./get-request');

module.exports = async (paths, count = 1) => {
    if (typeof paths === 'string') {
        paths = [ paths ];
    }
    for (let i = 0; i < count; i++) {
        for (const path of paths) {
            await get_request(path);
        }
    }
}
