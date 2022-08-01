
'use strict';

require('dotenv');
//const strapi = require('@strapi/strapi');
const { wait_util_ready, check_health } = require('./wait-util');

module.exports = {
  start,
  stop,
}

let app;

async function start(strapi) {

  let port = 1337;
  if (process.env.PORT) port = Number(process.env.PORT);

  if (app || await check_health(port)) return;

  const appContext = await strapi.compile();
  app = await strapi(appContext).load();

  app.start().catch(err => {
    app.log.error(err);
    process.exit(1);
  });

  await wait_util_ready(port);
}

async function stop() {
    if (app) {
      await app.destroy();
      app = null;
      process.exit(0);
    }
}

