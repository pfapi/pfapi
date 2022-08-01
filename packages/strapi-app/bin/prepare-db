#!/usr/bin/env node

'use strict';

const { prepare_db } = require('@pfapi/test-helpers');

let client = 'sqlite';
if (process.argv.length === 3) {
    client = process.argv[2];
}

prepare_db(client);
