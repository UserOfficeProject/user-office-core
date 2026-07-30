import react from '@vitejs/plugin-react';
import type { Plugin as EsbuildPlugin } from 'esbuild';
import {
  defineConfig,
  splitVendorChunkPlugin,
  loadEnv,
  UserConfig,
} from 'vite';

const POSTCSS_STUB_NAMESPACE = 'postcss-node-builtin-stub';

/**
 * `sanitize-html`, reached through `@user-office-software/duo-validation`, pulls
 * postcss into the browser bundle. postcss's own package.json maps "fs", "path",
 * "url" and "source-map-js" to `false` for browsers and guards every use of them
 * behind that, but the map is ignored for packages with an "exports" field, so
 * the dependency pre-bundler externalises them instead and postcss's top-level
 * `const { existsSync } = require('fs')` warns on every page load. The
 * production build resolves the browser map correctly and needs no help.
 */
const stubPostcssNodeBuiltins: EsbuildPlugin = {
  name: POSTCSS_STUB_NAMESPACE,
  setup(build) {
    build.onResolve({ filter: /^(fs|path|url|source-map-js)$/ }, (args) =>
      /[\\/]postcss[\\/]/.test(args.importer)
        ? { path: args.path, namespace: POSTCSS_STUB_NAMESPACE }
        : null
    );
    build.onLoad({ filter: /.*/, namespace: POSTCSS_STUB_NAMESPACE }, () => ({
      contents: 'module.exports = {};',
      loader: 'js',
    }));
  },
};

export default ({ mode }): UserConfig => {
  // Load "VITE" specific environment variables from .env file.
  const env = loadEnv(mode, process.cwd());

  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [splitVendorChunkPlugin(), react()],
    optimizeDeps: {
      esbuildOptions: {
        plugins: [stubPostcssNodeBuiltins],
      },
    },
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
      preserveSymlinks: true,
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
