/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  createMuiTheme,
  responsiveFontSizes,
  Theme,
} from '@material-ui/core/styles';
import createPalette from '@material-ui/core/styles/createPalette';

import { OrganisationTheme } from './theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const developHosts: any = {
  localhost: true,
  'useroffice-test.esss.lu.se': true,
};

const isDevelop = (): boolean => {
  return developHosts[window.location.hostname];
};

const devPalette = createPalette({
  primary: {
    dark: '#b33739',
    main: '#FF4E50',
    light: '#FC913A',
  },
  secondary: {
    dark: '#F9D423',
    main: '#F9D423',
    light: '#E1F5C4',
  },
  error: {
    main: '#f44336',
  },
  action: {},
});

const prodPalette = createPalette({
  primary: {
    dark: '#0081b0',
    main: '#0094ca',
    light: '#00a6e3',
  },
  secondary: {
    dark: '#85a600',
    main: '#99bf00',
    light: '#b8e600',
  },
  error: {
    main: '#f44336',
  },
});

const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ].join(','),
};

const devTheme = responsiveFontSizes(
  createMuiTheme({
    palette: devPalette,
    typography: typography,
  })
);

const prodTheme = responsiveFontSizes(
  createMuiTheme({
    palette: prodPalette,
    typography: typography,
  })
);

const theme = isDevelop() ? devTheme : prodTheme;

class EssTheme implements OrganisationTheme {
  getTheme(): Theme {
    return theme;
  }

  getHeaderLogo(): string | undefined {
    return undefined;
  }
}

export { EssTheme };
