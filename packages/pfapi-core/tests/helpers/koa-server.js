'use strict';

const Koa = require('koa');

const pfapi = require('./pfapi');

const app = new Koa();

app.use(pfapi);

app.listen(3000);

console.log('server runs on port 3000');