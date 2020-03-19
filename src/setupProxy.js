const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/files/*',
    proxy({
      target: 'http://localhost:4000',
      changeOrigin: true,
    })
  );
  app.use(
    '/proposal/*',
    proxy({
      target: 'http://localhost:4000',
      changeOrigin: true,
    })
  );
};
