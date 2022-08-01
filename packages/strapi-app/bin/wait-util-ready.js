#!/usr/bin/env node

'use strict';

const { wait_util_ready } = require('@pfapi/utils');

let port = 1337
if (process.argv.length === 3) {
    port = Number(process.argv[2]);
}

wait_util_ready(port);

