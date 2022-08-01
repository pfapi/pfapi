module.exports = ({ env }) => ({
    pfapi: {
      enabled: true,
      resolve: '../pfapi-plugin',
      config: {
        redis_uri: env('REDIS_URI'),
      }
    },
});