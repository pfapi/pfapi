module.exports = ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: 'localhost',
      port: 3306,
      database: 'pfapi_test',
      user: 'root',
      password: 'root',
      ssl: false,
    },
  },
});
