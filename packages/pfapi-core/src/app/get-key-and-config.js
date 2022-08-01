'use strict';

module.exports = (uid, data) => {
    if (global.PfapiApp) {
        return global.PfapiApp.get_key_and_config(uid, data);
    }
    return null;
}