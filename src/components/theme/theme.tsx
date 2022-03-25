import {
  ThemeProvider,
  Theme,
  createTheme,
  responsiveFontSizes,
  useTheme,
} from '@mui/material/styles';
import React, { useCallback, useContext } from 'react';
import { useEffect } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';

// NOTE: This comes from: https://mui.com/guides/migration-v4/#types-property-quot-palette-quot-quot-spacing-quot-does-not-exist-on-type-defaulttheme
declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const ThemeWrapper: React.FC = (props) => {
  const { settings } = useContext(SettingsContext);
  const defaultTheme = useTheme();

  const palette = {
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
    // NOTE: This was previous default background on the body. Now it is white and that's why we are overwriting it.
    // (https://v4.mui.com/customization/default-theme/#explore vs https://mui.com/customization/default-theme/#explore)
    background: {
      default: '#fafafa',
    },
  };

  // NOTE: If DatePicker/DateTimePicker are added here later we can add the desktopModeMediaQuery as default to fix this:
  // https://stackoverflow.com/a/69986695/5619063 and https://github.com/cypress-io/cypress/issues/970
  const theme = responsiveFontSizes(
    createTheme({
      palette: palette,
      components: {
        MuiTextField: {
          defaultProps: {
            variant: 'standard',
            margin: 'normal',
          },
        },
        MuiButton: {
          defaultProps: {
            variant: 'contained',
          },
        },
        MuiSelect: {
          defaultProps: {
            variant: 'standard',
          },
        },
        MuiFormControl: {
          defaultProps: {
            variant: 'standard',
            margin: 'none',
          },
        },
      },
    })
  );

  const updateCssPalette = useCallback(
    async function () {
      settings.forEach((setting) => {
        if (setting.id.startsWith('PALETTE')) {
          document.documentElement.style.setProperty(
            '--' + setting.id,
            setting.settingsValue
          );
        }
      });
    },
    [settings]
  );

  useEffect(() => {
    updateCssPalette();
  }, [updateCssPalette]);

  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};

export default ThemeWrapper;
