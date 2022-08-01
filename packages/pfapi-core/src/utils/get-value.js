'use strict';

module.exports = (value) => {
    if (value === undefined) {
        throw new Error('value is undefined');
    }
    if (Buffer.isBuffer(value)) {
        return value.toString('utf-8');
    }
    if (typeof value === 'string' && value !== '') {
        try {
            value = JSON.parse(value);
        } catch(err) {
            //console.error(err.message);
        }
    }
    return value;
}