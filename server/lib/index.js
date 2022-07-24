'use strict';

// const fs = require('fs')

// const { pfapi_path, helpers_path}  = require('./local-paths')

// const pfapi = pfapi_path && fs.existsSync(pfapi_path) ? require(pfapi_path) : require('@pfapi/core');
// const helpers = helpers_path && fs.existsSync(helpers_path) ? require(helpers_path) : require('@pfapi/query-helpers');

// module.exports = {
//     ...pfapi,
//     ...helpers
// }

module.exports = {
    ...require('@pfapi/core'),
    ...require('@pfapi/query-helpers')
}