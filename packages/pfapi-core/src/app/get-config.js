'use strict';

const default_configs = require('./default-configs');

module.exports = (uid, data = {}) => {
    if (!uid.startsWith('plugin::')) {
        if (global.PfapiApp) {
            return global.PfapiApp.get_app_config(uid);
        }
        return default_configs[uid];
    }
    if (global.PfapiApp) {
        return global.PfapiApp.get_config(uid, data);
    }
    return null;
}