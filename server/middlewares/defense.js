'use strict';

module.exports = (config, { strapi }) => {

    const { enabled = true } = config;

    return async (ctx, next) => {

        if (enabled && strapi.PfapiApp) {
            if (!strapi.PfapiApp.defense_ok(ctx)) {
                return;
            }
        }

        await next();

    }
};
