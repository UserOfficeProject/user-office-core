import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Single source of truth for the app's responsive layout values. Retune the
 * breakpoints here rather than writing new pixel media queries at call sites.
 */

/**
 * Width at or below which the navigation drawer becomes an overlay rather than
 * a permanent sidebar. Sits between MUI's `md` (900) and `lg` (1200) defaults,
 * which is why it is a pixel value and not a theme breakpoint.
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

/** True when the viewport is taller than it is wide. */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}
