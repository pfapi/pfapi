'use strict';

const find_one = require('../lib/find-one');
const find_many = require('../lib/find-many');
const get_count = require('../lib/get-count');
const aggregate_many = require('../lib/aggregate-many');
const aggregate_one = require('../lib/aggregate-one');
const getFilters = require('../lib/get-filters');

module.exports = {

  Pfapi: ({ strapi }) => ({
    async findOne(ctx) {
        await strapi.PfapiApp.handle(ctx, find_one);
    },
    async findMany(ctx) {
        await strapi.PfapiApp.handle(ctx, find_many);
    },
    async getFilters(ctx) {
        await strapi.PfapiApp.handle(ctx, getFilters);
    },
    async getCount(ctx) {
        await strapi.PfapiApp.handle(ctx, get_count);
    },
    async aggregateOne(ctx) {
        await strapi.PfapiApp.handle(ctx, aggregate_one);
    },
    async aggregateMany(ctx) {
        await strapi.PfapiApp.handle(ctx, aggregate_many);
    },
    async handleCacheRequest(ctx) {
        await strapi.PfapiApp.handle_cache_requests(ctx);
    }
  })
};
