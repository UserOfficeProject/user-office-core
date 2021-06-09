import {
  createMuiTheme,
  Theme,
  responsiveFontSizes,
} from '@material-ui/core/styles';
import createPalette from '@material-ui/core/styles/createPalette';

const palette = createPalette({
  primary: {
    dark: '#2e2d62',
    main: '#003088',
    light: '#1e5df8',
    contrastText: '#FFFFFF',
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

const theme: Theme = responsiveFontSizes(
  createMuiTheme({
    palette: palette,
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

export { theme };
