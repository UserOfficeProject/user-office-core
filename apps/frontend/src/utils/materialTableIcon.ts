import { SvgIconComponent } from '@mui/icons-material';
import { ReactNode } from 'react';

/**
 * `@material-table/core@6.4.4` bundles an older (v5) copy of the MUI types, so
 * the v9 `SvgIcon` components used across the app are not nominally assignable
 * to its `Action['icon']` type even though they are structurally identical.
 *
 * This helper performs a type-only cast to the `() => ReactNode` member of that
 * union. It does NOT change the runtime value: material-table renders the icon
 * with `React.createElement(icon, iconProps)` for non-function values (MUI icon
 * components are `memo` objects, not functions), so `iconProps` are preserved.
 */
export const asTableIcon = (Icon: SvgIconComponent): (() => ReactNode) =>
  Icon as unknown as () => ReactNode;
