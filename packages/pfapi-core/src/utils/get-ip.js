'use strict';

const { getClientIp } = require('request-ip');
const get_pfapi_prop = require('./get-pfapi-prop');

module.exports = (ctx) => {
    let result = get_pfapi_prop(ctx, 'ip');
    if (result !== undefined) return result;
    if (ctx.req) result = getClientIp(ctx.req);
    if (!result) result = ctx.ip;
    ctx.state.pfapi.ip = result;
    return result;
}