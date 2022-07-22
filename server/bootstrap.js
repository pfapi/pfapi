'use strict';

const { PfapiApp } = require('./lib');

module.exports = async ({ strapi }) => {
  const pfapi = new PfapiApp(strapi);
  await pfapi.start();
};
