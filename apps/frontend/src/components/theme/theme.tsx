import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
  useTheme,
} from '@mui/material/styles';
import React, { useCallback, useContext, useEffect } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';

const ThemeWrapper = (props: { children: React.ReactNode }) => {
  const { settingsMap } = useContext(SettingsContext);
  const defaultTheme = useTheme();

  const palette = {
    primary: {
      dark:
        settingsMap?.get(SettingsId.PALETTE_PRIMARY_DARK)?.settingsValue ||
        defaultTheme.palette.primary.dark,
      main:
        settingsMap.get(SettingsId.PALETTE_PRIMARY_MAIN)?.settingsValue ||
        defaultTheme.palette.primary.main,
      light:
        settingsMap.get(SettingsId.PALETTE_PRIMARY_LIGHT)?.settingsValue ||
        defaultTheme.palette.primary.light,
    },
    secondary: {
      dark:
        settingsMap.get(SettingsId.PALETTE_SECONDARY_DARK)?.settingsValue ||
        defaultTheme.palette.secondary.dark,
      main:
        settingsMap.get(SettingsId.PALETTE_SECONDARY_MAIN)?.settingsValue ||
        defaultTheme.palette.secondary.main,
      light:
        settingsMap.get(SettingsId.PALETTE_SECONDARY_LIGHT)?.settingsValue ||
        defaultTheme.palette.secondary.light,
    },
    error: {
      main:
        settingsMap.get(SettingsId.PALETTE_ERROR_MAIN)?.settingsValue ||
        defaultTheme.palette.error.main,
    },
    success: {
      main:
        settingsMap.get(SettingsId.PALETTE_SUCCESS_MAIN)?.settingsValue ||
        defaultTheme.palette.success.main,
    },
    warning: {
      main:
        settingsMap.get(SettingsId.PALETTE_WARNING_MAIN)?.settingsValue ||
        defaultTheme.palette.warning.main,
    },
    info: {
      main:
        settingsMap.get(SettingsId.PALETTE_INFO_MAIN)?.settingsValue ||
        defaultTheme.palette.info.main,
    },
    background: {
      default: '#fafafa',
    },
  };

  const baseTheme = createTheme({
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
  });

  const theme = responsiveFontSizes(
    createTheme(baseTheme, {
      components: {
        MuiPickersTextField: {
          defaultProps: {
            variant: 'standard',
          },
        },
        MuiDatePicker: {
          defaultProps: {
            desktopModeMediaQuery: baseTheme.breakpoints.up('sm'),
          },
        },
        MuiDateTimePicker: {
          defaultProps: {
            desktopModeMediaQuery: baseTheme.breakpoints.up('sm'),
          },
        },
        MuiTimePicker: {
          defaultProps: {
            desktopModeMediaQuery: baseTheme.breakpoints.up('sm'),
          },
        },
      },
    })
  );

  const updateCssPalette = useCallback(
    async function () {
      settingsMap.forEach((setting) => {
        if (setting.id.startsWith('PALETTE')) {
          document.documentElement.style.setProperty(
            '--' + setting.id,
            setting.settingsValue
          );
        }
      });
    },
    [settingsMap]
  );

  useEffect(() => {
    updateCssPalette();
  }, [updateCssPalette]);

  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};

export default ThemeWrapper;
