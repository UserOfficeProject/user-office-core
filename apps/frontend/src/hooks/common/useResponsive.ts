import { Breakpoint, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const DRAWER_OVERLAY_BREAKPOINT: Breakpoint = 'lg';
export const COMPACT_UI_BREAKPOINT: Breakpoint = 'md';

export const belowCompactUi = (theme: Theme) =>
  theme.breakpoints.down(COMPACT_UI_BREAKPOINT);

export const minTouchTarget = (theme: Theme) => theme.spacing(5.5);

export const compactTouchTarget = (theme: Theme, height: number) => {
  const size = theme.spacing(height);

  return {
    position: 'relative' as const,
    height: size,
    minHeight: size,
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      inset: `calc((${size} - ${minTouchTarget(theme)}) / 2)`,
    },
  };
};

export const bottomNavHeight = (theme: Theme) => theme.spacing(7);

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
