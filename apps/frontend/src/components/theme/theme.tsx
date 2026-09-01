import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
  useTheme,
} from '@mui/material/styles';
import React, { useCallback, useContext, useEffect } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';
import { belowCompactUi } from 'hooks/common/useResponsive';

// A grey that behaves like the rest of the palette, so components can ask for it
// through their `color` prop instead of overriding text and border by hand. It is
// fixed rather than instance-configurable: the PALETTE_* settings cover only the
// six semantic colours.
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    neutral: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    quiet: true;
  }
}

// The type scale the mobile cards and the questionary review are built from.
// Kept here rather than as constants beside each card, so the two stay in step.
declare module '@mui/material/styles' {
  interface TypographyVariants {
    cardTitle: React.CSSProperties;
    cardLabel: React.CSSProperties;
    cardValue: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    cardTitle?: React.CSSProperties;
    cardLabel?: React.CSSProperties;
    cardValue?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    cardTitle: true;
    cardLabel: true;
    cardValue: true;
  }
}

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
    neutral: defaultTheme.palette.augmentColor({
      color: { main: defaultTheme.palette.grey[600] },
      name: 'neutral',
    }),
    // NOTE: This was previous default background on the body. Now it is white and that's why we are overwriting it.
    // (https://v4.mui.com/customization/default-theme/#explore vs https://mui.com/customization/default-theme/#explore)
    background: {
      default: '#fafafa',
    },
  };

  const baseTheme = createTheme({
    palette: palette,
    typography: {
      cardTitle: {
        fontSize: 16,
        fontWeight: 550,
        lineHeight: 1.4,
        textWrap: 'pretty',
      },
      cardLabel: {
        fontSize: 13,
        lineHeight: 1.3,
        color: defaultTheme.palette.text.secondary,
      },
      cardValue: {
        fontSize: 15,
        fontWeight: 500,
        lineHeight: 1.3,
        overflowWrap: 'anywhere',
      },
    },
    components: {
      MuiCardContent: {
        styleOverrides: {
          root: {
            [belowCompactUi(defaultTheme)]: {
              padding: defaultTheme.spacing(1.5),
              '&:last-child': {
                paddingBottom: defaultTheme.spacing(1.5),
              },
            },
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            [belowCompactUi(defaultTheme)]: {
              padding: defaultTheme.spacing(1.5),
              paddingTop: 0,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          [belowCompactUi(defaultTheme)]: {
            'html, body': { scrollbarWidth: 'none' },
            'html::-webkit-scrollbar, body::-webkit-scrollbar': {
              display: 'none',
            },
          },
        },
      },
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
        variants: [
          // An outlined button that carries no palette colour, for sitting
          // beside a plain IconButton without outshouting it.
          {
            props: { variant: 'quiet' },
            style: {
              color: defaultTheme.palette.action.active,
              border: '1px solid',
              borderColor: defaultTheme.palette.divider,
              textTransform: 'none',
              '&:hover': {
                borderColor: defaultTheme.palette.divider,
                backgroundColor: defaultTheme.palette.action.hover,
              },
            },
          },
        ],
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

  // NOTE: the picker component keys below are not type-checked. Registering them
  // properly needs `import '@mui/x-date-pickers/themeAugmentation'`, which makes
  // `tsc` run out of heap on this codebase, and the second argument of
  // `createTheme(base, ...)` is typed as a plain object. Each key is verified to
  // be read via `useThemeProps` in @mui/x-date-pickers 9.12.0; if you rename one,
  // nothing will complain — it will just silently stop applying.
  const theme = responsiveFontSizes(
    createTheme(baseTheme, {
      components: {
        // Pickers render their own PickersTextField, so they do not inherit the
        // MuiTextField defaults above and would fall back to `outlined`.
        MuiPickersTextField: {
          defaultProps: {
            variant: 'standard',
          },
        },
        // Forces the desktop (popover) picker from `sm` upwards, which is also
        // what keeps Cypress able to drive the pickers:
        // https://stackoverflow.com/a/69986695/5619063 and
        // https://github.com/cypress-io/cypress/issues/970
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
