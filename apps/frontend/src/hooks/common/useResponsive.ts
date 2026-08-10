import { Breakpoint, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const DRAWER_OVERLAY_BREAKPOINT: Breakpoint = 'lg';
export const COMPACT_UI_BREAKPOINT: Breakpoint = 'sm';

export const toolbarHeight = (theme: Theme) => ({
  xs: theme.spacing(7),
  sm: theme.spacing(8),
});

export const drawerWidth = (theme: Theme) => theme.spacing(31.25);

export const drawerRailWidth = (theme: Theme) => ({
  xs: theme.spacing(6),
  sm: theme.spacing(8),
});

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
