// eslint-disable-next-line no-restricted-imports
import MaterialTableModule from '@material-table/core';

/**
 * Default export of `@material-table/core`. Import `MaterialTable` from here.
 *
 * The package only ships CommonJS. Because package.json has "type": "module",
 * Vite 8 resolves `import MaterialTable from '@material-table/core'` to the whole
 * `module.exports` object instead of `exports.default`, so unwrap it here.
 * Named imports (Column, Options, ...) still work from '@material-table/core'.
 * https://vite.dev/guide/migration#consistent-commonjs-interop
 */
const MaterialTable =
  (MaterialTableModule as unknown as { default?: typeof MaterialTableModule })
    .default ?? MaterialTableModule;
// Instance type, e.g. for `useRef<MaterialTable<Row>>()`.
type MaterialTable<RowData extends object> = MaterialTableModule<RowData>;

export default MaterialTable;
