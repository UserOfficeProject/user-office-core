/* eslint-disable @typescript-eslint/no-var-requires */
import { Theme } from '@material-ui/core/styles';

export function getTheme(): Theme {
  const org = process.env.REACT_APP_AUTH_PROVIDER;
  switch (org) {
    case 'stfc':
      return require('./stfcTheme').theme;
    default:
      return require('./essTheme').theme;
  }
}
