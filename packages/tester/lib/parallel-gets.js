'use strict';

const get_request = require('./get-request');

module.exports = async (paths, count = 1) => {
    if (typeof paths === 'string') {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(get_request(paths));
        }
        await Promise.all(promises);
    } else {
        for (let i = 0; i < count; i++) {
            const promises = [];
            for (const path of paths) {
                promises.push(get_request(path));
            }
            await Promise.all(promises);
        }
    }
}
