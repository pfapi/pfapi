'use strict';

module.exports = {

  pfapiController: {
    // for pfapi retrieve
    async findOne(ctx) {
      const service = strapi.plugin('pfapi').service('Pfapi');
      await service.findOne(ctx);
    },
    async findMany(ctx) {
      const service = strapi.plugin('pfapi').service('Pfapi');
      await service.findMany(ctx);
    },
    async getCount(ctx) {
      const service = strapi.plugin('pfapi').service('Pfapi');
      await service.getCount(ctx);
    },
    async aggregateMany(ctx) {
      const service = strapi.plugin('pfapi').service('Pfapi');
      await service.aggregateMany(ctx);
    },
    async aggregateOne(ctx) {
      const service = strapi.plugin('pfapi').service('Pfapi');
      await service.aggregateOne(ctx);
    },
    async getFilters(ctx) {
      const service = strapi.plugin('pfapi').service('Pfapi');
      await service.getFilters(ctx);
    },
    // for development and debug
    async handleCacheRequest(ctx) {
      const service = strapi.plugin('pfapi').service('Pfapi');
      await service.handleCacheRequest(ctx);
    }
  }

};
