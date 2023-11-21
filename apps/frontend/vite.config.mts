import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [splitVendorChunkPlugin(), react()],
  server: {
    open: true,
    port: 3000,
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
          target: 'http://localhost:4000',
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
