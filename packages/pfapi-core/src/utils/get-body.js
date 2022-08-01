'use strict';

module.exports = (data) => {
    if (data === undefined) {
        throw new Error('data is undefined');
    }
    if (data === null) return 'null';
    if (typeof data === 'string') return data;
    if (Buffer.isBuffer(data)) return data.toString('utf-8');
    return JSON.stringify(data);
};