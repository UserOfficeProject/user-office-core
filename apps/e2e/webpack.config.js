// NOTE: This file is needed for newest version of graphql-request to work in the e2e tests because it is commonjs module from version 5.2.0.
import { resolve as _resolve } from 'path';

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@user-office-software-libs/shared-types': _resolve(
        process.cwd(),
        '../frontend/src/generated/sdk.ts'
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
    ],
  },
};
