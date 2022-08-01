'use strict';

const crypto = require('crypto');
const base62 = require('base-x')('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
const get_body = require('./get-body');

module.exports = (input) => {
    const body = get_body(input);
    return base62.encode(crypto.createHash('sha1').update(body).digest()); 
};