import { Breakpoint } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const DRAWER_OVERLAY_BREAKPOINT: Breakpoint = 'lg';
export const COMPACT_UI_BREAKPOINT: Breakpoint = 'sm';

export const TOOLBAR_HEIGHT_XS = 56;
export const TOOLBAR_HEIGHT_SM = 64;

export const DRAWER_WIDTH = 250;

export function useIsBelow(breakpoint: Breakpoint): boolean {
  return useMediaQuery((theme) => theme.breakpoints.down(breakpoint));
}

export function useIsTabletOrMobile(): boolean {
  return useIsBelow(DRAWER_OVERLAY_BREAKPOINT);
}

export function useIsMobile(): boolean {
  return useIsBelow(COMPACT_UI_BREAKPOINT);
}

export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}
