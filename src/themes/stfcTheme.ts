/* eslint-disable @typescript-eslint/no-var-requires */
import {
  createMuiTheme,
  Theme,
  responsiveFontSizes,
} from '@material-ui/core/styles';
import createPalette from '@material-ui/core/styles/createPalette';
import createTypography from '@material-ui/core/styles/createTypography';

import { OrganisationTheme } from './theme';

const palette = createPalette({
  primary: {
    dark: '#2e2d62',
    main: '#003088',
    light: '#1e5df8',
    contrastText: '#ffffff',
  },
  secondary: {
    dark: '#d77900',
    main: '#ff9d1b',
    light: '#fbbe10',
    contrastText: '#000000',
  },
  error: {
    main: '#a91b2e',
  },
  success: {
    main: '#3e863e',
  },
  info: {
    main: '#1e5df8',
  },
  warning: {
    main: '#fbbe10',
  },
  contrastThreshold: 3,
  tonalOffset: 0.2,
});

const typography = createTypography(palette, {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Roboto',
    'Segoe UI',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ].join(','),
  h1: {
    color: palette.primary.dark,
  },
  h2: {
    color: palette.primary.dark,
  },
  h3: {
    color: palette.primary.dark,
  },
  h4: {
    color: palette.primary.dark,
  },
  h5: {
    color: palette.primary.dark,
  },
  h6: {
    color: palette.primary.dark,
  },
});

const theme: Theme = responsiveFontSizes(
  createMuiTheme({
    palette: palette,
    typography: typography,
    mixins: {
      toolbar: {
        '@media (min-width:600px)': {
          height: 72,
        },
      },
    },
    overrides: {
      MuiButton: {
        contained: {
          color: palette.primary.contrastText,
          backgroundColor: palette.primary.main,
          '&:hover': {
            color: palette.primary.contrastText,
            backgroundColor: palette.primary.light,
          },
        },
        containedPrimary: {
          color: palette.secondary.contrastText,
          backgroundColor: palette.secondary.main,
          '&:hover': {
            color: '#FFFFFF',
            backgroundColor: palette.secondary.dark,
          },
        },
        containedSecondary: {
          color: palette.primary.contrastText,
          backgroundColor: palette.primary.main,
          '&:hover': {
            color: palette.primary.contrastText,
            backgroundColor: palette.primary.light,
          },
        },
      },
      MuiSnackbarContent: {
        root: {
          '&[class*="SnackbarItem-variantSuccess"]': {
            backgroundColor: palette.success.main,
            color: palette.common.white,
          },
          '&[class*="SnackbarItem-variantError"]': {
            backgroundColor: palette.error.main,
            color: palette.common.white,
          },
          '&[class*="SnackbarItem-variantWarning"]': {
            backgroundColor: palette.warning.main,
            color: palette.common.white,
          },
          '&[class*="SnackbarItem-variantInformation"]': {
            backgroundColor: palette.info.main,
            color: palette.common.black,
          },
        },
      },
    },
    props: {
      MuiCircularProgress: {
        color: 'primary',
      },
      MuiTabs: {
        TabIndicatorProps: {
          style: {
            background: palette.secondary.main,
          },
        },
      },
      MuiDrawer: {
        variant: 'permanent',
      },
    },
  })
);

class StfcTheme implements OrganisationTheme {
  getTheme(): Theme {
    return theme;
  }

  getHeaderLogo(): string | undefined {
    return require('../images/stfc-ukri-white.svg').default;
  }
}

export { StfcTheme };
