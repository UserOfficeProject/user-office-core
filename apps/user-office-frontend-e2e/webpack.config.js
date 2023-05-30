import { resolve as _resolve } from 'path';

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@user-office-software-libs/shared-types': _resolve(
        process.cwd(),
        '../user-office-frontend/src/generated/sdk.ts'
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        // exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
            plugins: [
              '@babel/plugin-transform-logical-assignment-operators',
              '@babel/plugin-transform-nullish-coalescing-operator',
            ],
          },
        },
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: _resolve(__dirname, 'dist'),
  },
};
