'use strict';

const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = require('base-x')(charset);

module.exports = {
    get_etag,
    parse_etag,
};

function get_etag({key, checksum}) {
    const etag_value = base62.encode(Buffer.from(`${key}-${checksum}`));
    return `"${etag_value}"`;
}

function parse_etag(etag) {
    const base62_chars = etag.split('').filter(x => charset.includes(x)).join('');
    const etag_value = String.fromCharCode(...base62.decode(base62_chars));
    if (!etag_value) return null;
    const parts = etag_value.split('-');
    if (parts.length === 2) {
        const [key, checksum] = parts;
        if (key && checksum) {
            return {key, checksum};
        }
    }
    return null;
}

