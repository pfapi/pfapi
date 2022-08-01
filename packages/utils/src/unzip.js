'use strict';

const fs = require('fs-extra');
const node_path = require('path');
const unzipper = require('unzipper');

module.exports = (src_filepath, des_path) => {
    return fs.createReadStream(src_filepath).pipe(unzipper.Parse())
        .on('entry', (entry) => {
            const filepath = `${des_path}/${entry.path}`;
            if (!filepath.endsWith(node_path.sep)) {
                const writeStream = fs.createWriteStream(filepath);
                return entry.pipe(writeStream);
            } else if (!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, {recursive: true});
            }
        }).promise();
}