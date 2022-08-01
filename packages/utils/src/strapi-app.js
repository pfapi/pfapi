
'use strict';

require('dotenv');
//const strapi = require('@strapi/strapi');
const { wait_util_ready } = require('./wait-util');

module.exports = {
  start,
  stop,
}

let app;

async function start(strapi) {

  if (app) return;

  const appContext = await strapi.compile();
  app = await strapi(appContext).load();

  app.start().catch(err => {
    app.log.error(err);
    process.exit(1);
  });

  let port = 1337;
  if (process.env.PORT) port = Number(process.env.PORT);

  await wait_util_ready(port);
}

function stop() {
    if (app) {
      app.destroy();
      app = null;
    }
}

