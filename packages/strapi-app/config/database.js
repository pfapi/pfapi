const path = require('path');

module.exports = ({ env }) => {
  const client = env('DB', 'sqlite')
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
  } else if (client === 'sqlite') {
    return {
      connection: {
        client,
        connection: {
          filename: path.join(__dirname, '..', '.tmp/data.db'),
        },
        useNullAsDefault: true,
      },
    };
  } else {
    throw new Error(`database ${client} not supported`)
  }
}
