import react from '@vitejs/plugin-react';
import {
  defineConfig,
  splitVendorChunkPlugin,
  loadEnv,
  UserConfig,
} from 'vite';

export default ({ mode }): UserConfig => {
  // Load "VITE" specific environment variables from .env file.
  const env = loadEnv(mode, process.cwd());

  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [splitVendorChunkPlugin(), react()],
    server: {
      open: true,
      host: true,
      port: env.VITE_DEV_SERVER_PORT ? Number(env.VITE_DEV_SERVER_PORT) : 3000,
      proxy: {
        ...[
          '/graphql',
          '/downloads',
          '/download',
          '/uploads',
          '/files',
          '/preview',
        ].reduce((acc, curr) => {
          acc[curr] = {
            target: env.VITE_DEV_SERVER_PROXY_TARGET || 'http://localhost:4000',
            changeOrigin: true,
          };

          return acc;
        }, {}),
      },
    },
    resolve: {
      alias: {
        context: '/src/context',
        hooks: '/src/hooks',
        utils: '/src/utils',
        generated: '/src/generated',
        i18n: '/src/i18n',
        styles: '/src/styles',
        components: '/src/components',
        models: '/src/models',
        units: '/src/units',
        images: '/src/images',
      },
    },
    build: {
      outDir: 'build',
    },
  });
};
