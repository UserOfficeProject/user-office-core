import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.{ts,js}'],
    ignores: [
      'build/*',
      'coverage/*',
      '**/*.d.ts', // data definition files
      'src/public/', //3rd party libs
      'src/types/', 
      'openapi.yaml', //# auto-generated REST client for the STFC UserOfficeWebService
      'generated/',
      // node_modules is ignored by default
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'es2018',
        sourceType: 'module',
      },
      globals: { ...globals.node },
    },
    // settings: {
    //   node: {
    //     extensions: ['.js', '.ts'],
    //   }
    // },
    plugins: {
      'unused-imports': unusedImports,
      prettier,
      jest
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-console': 'error', // prefer `duo-logger` over console

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          // distinctGroup: true,
          pathGroups: [
            {
              pattern: '@src/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // TypeScript rules
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['PascalCase', 'camelCase'],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': [
        'warn',
        {
          ignoreParameters: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',

      // Other style rules
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],

      // Handle unused imports
      'unused-imports/no-unused-imports': 'error',
      //TS already handles undef variables
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-unused-expressions': 'off',
      //We use these 2 rules in some places intentionally
      'no-prototype-builtins': 'off',
      'no-case-declarations': 'off',
      '@typescript-eslint/no-unused-expressions': [ 'error', { allowShortCircuit: true, allowTernary: true } ],
    },
  },
);