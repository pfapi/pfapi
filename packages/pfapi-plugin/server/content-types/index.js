'use strict';

const pfapiActivity = require('./pfapi-activity');
const pfapiHandle = require('./pfapi-handle');
const pfapiIp = require('./pfapi-ip');
const pfapiKey = require('./pfapi-key');
const pfapiRateLimit = require('./pfapi-rate-limit');
const pfapiState = require('./pfapi-state');

module.exports = {
    'pfapi-activity': pfapiActivity,
    'pfapi-handle': pfapiHandle,
    'pfapi-ip': pfapiIp,
    'pfapi-key': pfapiKey,
    'pfapi-rate-limit': pfapiRateLimit,
    'pfapi-state': pfapiState,
};
