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
      tsconfigPaths: true,
      alias: [
        // @mui/icons-material v5 has no "exports" map, so `@mui/icons-material/<Icon>`
        // resolves to a CommonJS file.
        // https://vite.dev/guide/migration#consistent-commonjs-interop
        // TODO: Remove this alias once @mui/icons-material is upgraded to a version
        // whose package.json ships an "exports" map pointing deep imports at ESM.
        {
          find: /^@mui\/icons-material\/(?!esm\/)(.+)$/,
          replacement: '@mui/icons-material/esm/$1',
        },
      ],
    },
    build: {
      outDir: 'build',
      rolldownOptions: {
        output: {
          codeSplitting: {
            // TinyMCE is left out on purpose.
            // https://rolldown.rs/reference/OutputOptions.codeSplitting
            groups: [{ test: /node_modules\/(?!tinymce\/)/, name: 'vendor' }],
          },
        },
      },
    },
  });
};
