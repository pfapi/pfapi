'use strict';

const get_dependency_key = require('../utils/get-dependency-key');
const logging = require('./logging');

module.exports = (dependencies) => {
    const dependent_keys = [];
    if (dependencies.length === 0) return dependent_keys
    try {
        const uids = [];
        for (const {uid, id} of dependencies) {
            if (!uid) continue;
            if (!uids.includes(uid)) uids.push(uid)
            const key = get_dependency_key({uid, id});
            if (key) dependent_keys.push(key);
        }
        if (global.PfapiApp && global.PfapiApp.subscribe_lifecycle_events) {
            for (const uid of uids) {
                global.PfapiApp.subscribe_lifecycle_events(uid);
            }
        } else {
            logging.error('global.PfapiApp not ready');
        }
        return dependent_keys;
    } catch(err) {
        logging.error(err.message);
    }
    return null;
}