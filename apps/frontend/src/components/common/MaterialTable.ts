// eslint-disable-next-line no-restricted-imports
import MaterialTableModule from '@material-table/core';

/**
 * Default export of `@material-table/core`. Import `MaterialTable` from here.
 * The package only ships CommonJS this means we currently need a way to unbundle the module to ES modules
 * https://vite.dev/guide/migration#consistent-commonjs-interop
 * https://rolldown.rs/in-depth/bundling-cjs#ambiguous-default-import-from-cjs-modules
 */
// TODO: Remove once @mui/icons-material table is upgraded to ES modules
type CjsInterop<T> = T & { __esModule?: boolean; default?: T };
const cjsModule = MaterialTableModule as CjsInterop<typeof MaterialTableModule>;

const MaterialTable =
  cjsModule.__esModule && cjsModule.default
    ? cjsModule.default
    : MaterialTableModule;
// Instance type, e.g. for `useRef<MaterialTable<Row>>()`.
type MaterialTable<RowData extends object> = MaterialTableModule<RowData>;

export default MaterialTable;
