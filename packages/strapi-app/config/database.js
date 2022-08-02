'use strict';

const path = require('path');

module.exports = ({ env }) => {

  const client = env('DB', 'sqlite');

  console.log('database config', {client});

  if (client === 'mysql') {
    return {
      connection: {
        client,
        connection: {
          host: 'localhost',
          port: 3306,
          database: 'pfapi_test',
          user: 'root',
          password: 'root',
          ssl: false,
        },
      },
    };
  }
  if (client === 'sqlite') {
    return {
      connection: {
        client,
        connection: {
          filename: path.join(__dirname, '..', '.tmp/data.db'),
        },
        useNullAsDefault: true,
      },
    };
  }

  throw new Error(`database ${client} not supported`)
}