import {
  createMuiTheme,
  responsiveFontSizes,
  useTheme,
  StylesProvider,
} from '@material-ui/core';
import createPalette from '@material-ui/core/styles/createPalette';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useContext } from 'react';
import { useEffect } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';

const Theme: React.FC = (props) => {
  const { settings } = useContext(SettingsContext);
  const defaultTheme = useTheme();

  const palette = createPalette({
    primary: {
      dark:
        settings?.get(SettingsId.PALETTE_PRIMARY_DARK)?.settingsValue ||
        defaultTheme.palette.primary.dark,
      main:
        settings.get(SettingsId.PALETTE_PRIMARY_MAIN)?.settingsValue ||
        defaultTheme.palette.primary.main,
      light:
        settings.get(SettingsId.PALETTE_PRIMARY_LIGHT)?.settingsValue ||
        defaultTheme.palette.primary.light,
    },
    secondary: {
      dark:
        settings.get(SettingsId.PALETTE_SECONDARY_DARK)?.settingsValue ||
        defaultTheme.palette.secondary.dark,
      main:
        settings.get(SettingsId.PALETTE_SECONDARY_MAIN)?.settingsValue ||
        defaultTheme.palette.secondary.main,
      light:
        settings.get(SettingsId.PALETTE_SECONDARY_LIGHT)?.settingsValue ||
        defaultTheme.palette.secondary.light,
    },
    error: {
      main:
        settings.get(SettingsId.PALETTE_ERROR_MAIN)?.settingsValue ||
        defaultTheme.palette.error.main,
    },
    success: {
      main:
        settings.get(SettingsId.PALETTE_SUCCESS_MAIN)?.settingsValue ||
        defaultTheme.palette.success.main,
    },
    warning: {
      main:
        settings.get(SettingsId.PALETTE_WARNING_MAIN)?.settingsValue ||
        defaultTheme.palette.warning.main,
    },
    info: {
      main:
        settings.get(SettingsId.PALETTE_INFO_MAIN)?.settingsValue ||
        defaultTheme.palette.info.main,
    },
  });

  const theme = responsiveFontSizes(
    createMuiTheme({
      palette: palette,
    })
  );

  useEffect(() => {
    // Update root CSS variables when settings are changed
    settings.forEach((setting) => {
      if (setting.id.startsWith('PALETTE')) {
        document.documentElement.style.setProperty(
          '--' + setting.id,
          setting.settingsValue
        );
      }
    });
  }, [settings]);

  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </StylesProvider>
  );
};

export default Theme;
