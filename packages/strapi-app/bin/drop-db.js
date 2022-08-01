#!/usr/bin/env node

'use strict';

const { drop_db } = require('@pfapi/test-helpers');

let client = 'sqlite';
if (process.argv.length === 3) {
    client = process.argv[2];
}

drop_db(client);
