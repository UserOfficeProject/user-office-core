import react from '@vitejs/plugin-react';
import {
  ConfigEnv,
  defineConfig,
  loadEnv,
  ProxyOptions,
  UserConfig,
} from 'vite';

export default ({ mode }: ConfigEnv): UserConfig => {
  // Load "VITE" specific environment variables from .env file.
  const env = loadEnv(mode, process.cwd());

  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [react()],
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
        ].reduce<Record<string, ProxyOptions>>((acc, curr) => {
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
      alias: [
        // @mui/icons-material v5 has no "exports" map, so `@mui/icons-material/<Icon>`
        // resolves to a CommonJS file.
        // https://vite.dev/guide/migration#consistent-commonjs-interop
        {
          find: /^@mui\/icons-material\/(?!esm\/)(.+)$/,
          replacement: '@mui/icons-material/esm/$1',
        },
        { find: 'context', replacement: '/src/context' },
        { find: 'hooks', replacement: '/src/hooks' },
        { find: 'utils', replacement: '/src/utils' },
        { find: 'generated', replacement: '/src/generated' },
        { find: 'i18n', replacement: '/src/i18n' },
        { find: 'styles', replacement: '/src/styles' },
        { find: 'components', replacement: '/src/components' },
        { find: 'models', replacement: '/src/models' },
        { find: 'units', replacement: '/src/units' },
        { find: 'images', replacement: '/src/images' },
      ],
    },
    build: {
      outDir: 'build',
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{ test: /node_modules\//, name: 'vendor' }],
          },
          // https://rolldown.rs/reference/OutputOptions.strictExecutionOrder required for TinyMCE.
          strictExecutionOrder: true,
        },
      },
    },
  });
};
