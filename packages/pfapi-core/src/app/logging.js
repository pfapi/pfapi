'use strict';

const util = require('util');
const debug_tool = require('debug')('pfapi:debug');

module.exports = {
    error,
    warn,
    debug,
    info,
    cmsg,
    json,
}

function error(...args) {
    const message = cmsg(args);
    if (global.strapi) {
        global.strapi.log.error(message);
    } else {
        console.error('ERROR', message);
    }
}

function warn(...args) {
    const message = cmsg(args);
    if (global.strapi) {
        global.strapi.log.warn(message);
    } else {
        console.warn('WARN', message);
    }
}

function debug(...args) {
    debug_tool(cmsg(args));
}

function info(...args) {
    const message = cmsg(args);
    if (global.strapi) {
        global.strapi.log.info(message);
    } else {
        console.log('INFO', message);
    }
}

function cmsg(...args) {
    if (args.length === 1 && Array.isArray(args[0])) args = args[0];
    let message = '';
    for (const value of args) {
        if (message !== '') message += ' ';
        if (typeof value === 'object') {
            message += util.inspect(value,  {breakLength: Infinity, depth: null, colors: true});
        } else {
            message += String(value);
        }
    }
    return message;
}

function json(...args) {
    if (args.length === 1 && Array.isArray(args[0])) args = args[0];
    let message = '';
    for (const value of args) {
        if (message !== '') message += ' ';
        if (typeof value === 'object') {
            message += util.inspect(value,  {depth: null, colors: true});
        } else {
            message += String(value);
        }
    }
    return message;
}