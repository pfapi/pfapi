'use strict';

module.exports = (ctx, key) => {
    if (!ctx.state) ctx.state = {pfapi: {}};
    else if (!ctx.state.pfapi) {
        ctx.state.pfapi = {};
    } else if (key && ctx.state.pfapi[key] !== undefined) {
        return ctx.state.pfapi[key];
    }
}