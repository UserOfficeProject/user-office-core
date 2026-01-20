import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import pluginCypress from 'eslint-plugin-cypress'

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
      parser: tsParser,
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
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    rules: {
      //
      // Import rules
      //
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

      //
      // TypeScript
      //
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
      // "@typescript-eslint/ban-types": [
      //   "error",
      //   {
      //     types: {
      //       Function: {
      //         message: "Use `FunctionType` instead",
      //         fixWith: "FunctionType",
      //       },
      //     },
      //   },
      // ],
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      //
      // Unused imports
      //
      "unused-imports/no-unused-imports": "error",

      //
      // Cypress
      //
      "cypress/unsafe-to-chain-command": "off",

      //
      // Prettier
      //
      "prettier/prettier": "error",
    },
  },
]);