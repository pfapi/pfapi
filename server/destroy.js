'use strict';

module.exports = async ({ strapi }) => {
  if (strapi.PfapiApp) {
    await strapi.PfapiApp.stop();
  }
};
