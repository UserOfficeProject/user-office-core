import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Single source of truth for the app's responsive layout values.
 *
 * Before this module the same breakpoints were written as raw pixel media
 * queries in four different components, so "mobile" meant a different width
 * depending on which component you asked. The values below deliberately match
 * what those components used previously, so centralising them is not a
 * behavioural change — retune them here when the mobile work starts.
 */

/**
 * Width at or below which the navigation drawer becomes an overlay rather than
 * a permanent sidebar. Sits between MUI's `md` (900) and `lg` (1200) defaults,
 * which is why it is expressed in pixels rather than as a theme breakpoint.
 */
export const TABLET_OR_MOBILE_MAX_WIDTH = 1224;

/** Width at or below which dense UI (tab bars, questionary steppers) collapses. */
export const MOBILE_MAX_WIDTH = 500;

/** MUI's default AppBar heights; `mixins.toolbar` uses the same values. */
export const TOOLBAR_HEIGHT_XS = 56;
export const TOOLBAR_HEIGHT_SM = 64;

/** Width of the expanded navigation drawer. */
export const DRAWER_WIDTH = 250;

/** True when the viewport is narrow enough that the drawer should overlay. */
export function useIsTabletOrMobile(): boolean {
  return useMediaQuery(`(max-width: ${TABLET_OR_MOBILE_MAX_WIDTH}px)`);
}

/** True on phone-sized viewports, where dense UI needs to collapse. */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
}
