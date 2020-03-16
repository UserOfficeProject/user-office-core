import proxy from 'http-proxy-middleware';

export default function(app) {
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
}
