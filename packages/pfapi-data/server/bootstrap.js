'use strict';

const load_data = require('../data');

module.exports = async ({ strapi }) => {
    await load_data(strapi);
};
