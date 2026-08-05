import { Breakpoint } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Single source of truth for the app's responsive layout values. Thresholds are
 * theme breakpoints, so retune them in the theme rather than here, and prefer
 * `useIsBelow` over writing a new pixel media query at a call site.
 */

/** Below this the navigation drawer overlays rather than sitting permanently. */
export const DRAWER_OVERLAY_BREAKPOINT: Breakpoint = 'lg';

/** Below this dense UI (tab bars, questionary steppers) collapses. */
export const COMPACT_UI_BREAKPOINT: Breakpoint = 'sm';

/** MUI's default AppBar heights; `mixins.toolbar` uses the same values. */
export const TOOLBAR_HEIGHT_XS = 56;
export const TOOLBAR_HEIGHT_SM = 64;

/** Width of the expanded navigation drawer. */
export const DRAWER_WIDTH = 250;

/** True when the viewport is narrower than the given theme breakpoint. */
export function useIsBelow(breakpoint: Breakpoint): boolean {
  return useMediaQuery((theme) => theme.breakpoints.down(breakpoint));
}

/** True when the viewport is narrow enough that the drawer should overlay. */
export function useIsTabletOrMobile(): boolean {
  return useIsBelow(DRAWER_OVERLAY_BREAKPOINT);
}

/** True on phone-sized viewports, where dense UI needs to collapse. */
export function useIsMobile(): boolean {
  return useIsBelow(COMPACT_UI_BREAKPOINT);
}

/** True when the viewport is taller than it is wide. */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}
