'use strict';

const Netmask = require('netmask').Netmask;
const Throttle = require('../lib/throttle');
const get_ip = require('../utils/get-ip');

class HttpThrottle extends Throttle {

    constructor(app) {
        super(app.redis_cache, app.local_cache);
        this.app = app;
        const rate_limits = app.get_app_config('RateLimit');
        if (rate_limits) this.apply_rate_limits(rate_limits);
    }

    /**
     *
     * @param {*} rate_limits 
     */
    apply_rate_limits(rate_limits) {
        this.reset();
        for (const rate_limit of rate_limits) {
            this.add_throttle(rate_limit);
        }
    }

    get_signature(ctx, params) {
        if (this.app.is_unlimited && this.app.is_unlimited(ctx)) {
            return null;
        }
        const prefix = params.prefix || '';
        if (prefix && !ctx.path.startsWith(prefix)) return false;
        const base = params.ip_mask ? new Netmask(get_ip(ctx), params.ip_mask).base : '';
        return { base, prefix };
    }
}

module.exports = HttpThrottle;