/* eslint-disable @typescript-eslint/no-var-requires */
import { Theme } from '@material-ui/core/styles';

import { EssTheme } from './essTheme';
import { StfcTheme } from './stfcTheme';

interface OrganisationTheme {
  getTheme: () => Theme;
  getHeaderLogo: () => string | undefined;
}

let theme: OrganisationTheme;
const org = process.env.REACT_APP_AUTH_PROVIDER;
switch (org) {
  case 'stfc':
    theme = new StfcTheme();
    break;
  default:
    theme = new EssTheme();
}

export function getTheme(): Theme {
  return theme.getTheme();
}

export function getHeaderLogo(): string | undefined {
  return theme.getHeaderLogo();
}

export type { OrganisationTheme };
