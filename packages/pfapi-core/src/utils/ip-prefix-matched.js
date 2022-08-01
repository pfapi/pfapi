'use strict';

const { matches } = require('ip-matching');
const get_ip = require('./get-ip');

module.exports = (ctx, list) => {
    if (!list || list.length === 0) return false;
    const request_ip = get_ip(ctx);
    const request_path = ctx.path;
    for (const { ip_cidr, prefix, status } of list) {
        if (prefix && !request_path.startsWith(prefix)) continue;
        if (ip_cidr && request_ip && !matches(request_ip, ip_cidr)) continue;
        return status;
    }
    return false;
}
