'use strict';

/**
 * world-city service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::world-city.world-city');
