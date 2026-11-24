import MenuIcon from '@mui/icons-material/Menu';
import { Box } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';
import {
  drawerWidth,
  useIsPortrait,
  useIsTabletOrMobile,
} from 'hooks/common/useResponsive';

import AccountActionButton from './AccountActionButton';

type AppToolbarProps = {
  /** Content of the information modal. */
  open: boolean;
  /** Text of the button link in the information modal. */
  handleDrawerOpen: () => void;
  header: string;
};

const AppToolbar = ({ open, handleDrawerOpen, header }: AppToolbarProps) => {
  const { settingsMap } = useContext(SettingsContext);
  const location = useLocation();
  const isTabletOrMobile = useIsTabletOrMobile();
  const isPortraitMode = useIsPortrait();
  const [logo, setLogo] = useState('');
  const theme = useTheme();

  useEffect(() => {
    if (location.pathname === '/') document.title = 'User Office Dashboard';
  }, [location.pathname]);

  const logoFilename = settingsMap.get(
    SettingsId.HEADER_LOGO_FILENAME
  )?.settingsValue;

  useEffect(() => {
    setLogo('/images/' + logoFilename);
  }, [logoFilename]);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: isTabletOrMobile
          ? theme.zIndex.drawer
          : theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
          marginLeft: isTabletOrMobile ? 0 : drawerWidth(theme),
          width: isTabletOrMobile
            ? '100%'
            : `calc(100% - ${drawerWidth(theme)})`,
          transition: isTabletOrMobile
            ? 'none'
            : theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
        }),
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open drawer"
            onClick={handleDrawerOpen}
            sx={{
              ...(open && {
                marginRight: '220px',
                display: isTabletOrMobile ? 'inline-flex' : 'none',
              }),
            }}
            data-cy="open-drawer"
          >
            <MenuIcon />
          </IconButton>
          {(!isTabletOrMobile || !isPortraitMode) && logo && (
            <Link className={'header-logo-container'} to="/">
              <img
                src={logo}
                alt="Institution logo"
                className={'header-logo'}
              />
            </Link>
          )}
          <Typography
            component="h1"
            variant="h6"
            noWrap
            sx={{
              color: 'inherit',
            }}
          >
            {location.pathname === '/' ? 'Dashboard' : header}
          </Typography>
        </Box>
        <AccountActionButton />
      </Toolbar>
    </AppBar>
  );
};

export default AppToolbar;
