import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import pluginCypress from 'eslint-plugin-cypress'
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';

export default defineConfig([
  {
    ignores: ["node_modules/",
              "dist/",
              "cypress/node_modules",
              ".next",
              "build",
              "dist",
              "public",
              "src/serviceWorker.js",
              "src/setupProxy.js",
              "src/generated/sdk.ts",
              "server.js",
              "webpack.config.js",
              "eslint.config.js" // Some weird bug with eslint causes it to fail to find the typescript-eslint node module
              ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  pluginCypress.configs.recommended,
  // Cypress + TypeScript
  {
    files: ["cypress/**/*.ts"],

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2018,
      sourceType: "module",

      globals: {
        browser: true,
        node: true,
        es6: true,
        cypress: true,
      },
    },

    plugins: {
      "unused-imports": unusedImports,
      prettier,
      'chai-friendly': pluginChaiFriendly,
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      "@typescript-eslint/no-use-before-define": ["error"],
      "@typescript-eslint/no-empty-function": [
        "error",
        { allow: ["arrowFunctions"] },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["PascalCase", "camelCase"],
        },
      ],

      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",


      "unused-imports/no-unused-imports": "error",

      "cypress/unsafe-to-chain-command": "off",

      "prettier/prettier": "error",

      "no-unused-expressions": "off", // disable original rule
      "@typescript-eslint/no-unused-expressions": "off", // disable the typescript version of the rule as it reports incorrectly in some cases
      "chai-friendly/no-unused-expressions": [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],

      "padding-line-between-statements": [
        "error",
        { "blankLine": "always", "prev": "*", "next": "return" }
      ],
    },
  },
]);