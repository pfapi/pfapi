'use strict';

module.exports = [
  /**
   * routes available for development and debug
   */
   {
    method: 'GET',
    path: '/cache/:type/:key',
    handler: 'pfapiController.handleCacheRequest',
    config: {
      auth: false
    },
  },
  /**
   * retrieve routes for pfapi
   */
   {
    method: 'GET',
    path: '/get-filters/:handle',
    handler: 'pfapiController.getFilters',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/find-many/:handle',
    handler: 'pfapiController.findMany',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/find-one/:handle/:id',
    handler: 'pfapiController.findOne',
    config: {
      auth: false
    },
  },
  {
    method: 'GET',
    path: '/get-count/:handle',
    handler: 'pfapiController.getCount',
    config: {
      auth: false,
    },
  },
  {
     method: 'GET',
     path: '/:handle/:id',
     handler: 'pfapiController.aggregateOne',
     config: {
       auth: false
     },
  },
  {
    method: 'GET',
    path: '/:handle',
    handler: 'pfapiController.aggregateMany',
    config: {
      auth: false,
    },
  }
  
];
