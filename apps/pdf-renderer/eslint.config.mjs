// For some reason ESLint's own types are not resolved correctly :)
/* eslint-disable import/no-unresolved */
import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['build/*', 'coverage/*', '**/*.d.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'es2020',
        sourceType: 'module',
      },
      globals: { ...globals.node },
    },
    plugins: {
      'unused-imports': unusedImports,
      prettier,
      jest,
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-console': 'error',
      'prettier/prettier': 'error',
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
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      'unused-imports/no-unused-imports': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
]);
