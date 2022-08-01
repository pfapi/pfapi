
'use strict';

require('dotenv');
const { execSync } = require('child_process');
//const strapi = require('@strapi/strapi');
const { wait_util_ready, check_health } = require('./wait-util');
const find = require('find-process');

module.exports = {
  start,
  stop,
}

let app;

const port = process.env.PORT ? Number(process.env.PORT) : 1337;

async function start(strapi) {

  if (app || await check_health(port)) return;

  const appContext = await strapi.compile();
  app = await strapi(appContext).load();

  app.start().catch(err => {
    app.log.error(err);
    process.exit(1);
  });

  await wait_util_ready(port);
}

async function stop(force = false) {
    if (app) {
      await app.destroy();
      process.exit(0);
    } else if (force && await check_health(port)) {
        const ps = await find('port', port);
        if (ps.length > 0) {
          console.log(ps)
          const str = ps.map(x => x.pid).join(' ');
          execSync(`kill -9 ${str}`);
        } else {
          console.log(`kill -9 $(lsof -i :${port} | awk '{print $2}')`)
          execSync(`kill -9 $(lsof -i :${port} | awk '{print $2}')`);
        }
    }
}

