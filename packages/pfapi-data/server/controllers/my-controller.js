'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('strapi-plugin-pfapi-data')
      .service('myService')
      .getWelcomeMessage();
  },
};
