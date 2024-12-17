/* eslint-disable @typescript-eslint/no-var-requires */
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId } from 'generated/sdk';

import AccountActionButton from './AccountActionButton';
const drawerWidth = 250;

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
  const isTabletOrMobile = useMediaQuery('(max-width: 1224px)');
  const isPortraitMode = useMediaQuery('(orientation: portrait)');
  const [logo, setLogo] = useState('');
  const theme = useTheme();

  if (location.pathname === '/') document.title = 'User Office Dashboard';
  const logoFilename = settingsMap.get(
    SettingsId.HEADER_LOGO_FILENAME
  )?.settingsValue;

  useEffect(() => {
    setLogo('/images/' + logoFilename);
  }, [logoFilename]);

  const { user, roles, currentRole } = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);
  const humanReadableActiveRole = useMemo(
    () =>
      roles.find(({ shortCode }) => shortCode.toUpperCase() === currentRole)
        ?.title ?? 'Unknown',
    [roles, currentRole]
  );
  const externalProfileLink = settingsContext.settingsMap.get(
    SettingsId.PROFILE_PAGE_LINK
  )?.settingsValue;

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
          marginLeft: isTabletOrMobile ? 0 : drawerWidth,
          width: isTabletOrMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
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
        <IconButton
          edge="start"
          color="inherit"
          aria-label="Open drawer"
          onClick={handleDrawerOpen}
          sx={{
            marginRight: 15,
            ...(open && { display: isTabletOrMobile ? 'inline-flex' : 'none' }),
          }}
          data-cy="open-drawer"
        >
          <MenuIcon />
        </IconButton>
        {(!isTabletOrMobile || !isPortraitMode) && logo && (
          <Link className={'header-logo-container'} to="/">
            <img src={logo} alt="Institution logo" className={'header-logo'} />
          </Link>
        )}
        {(!isTabletOrMobile || !isPortraitMode) && (
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {location.pathname === '/' ? 'Dashboard' : header}
          </Typography>
        )}
        <Box sx={{ marginLeft: 'auto', margin: theme.spacing(0, 0.5) }}>
          Logged in as{' '}
          {externalProfileLink ? (
            <MuiLink
              href={externalProfileLink}
              target="_blank"
              rel="noreferrer"
              sx={{
                color: theme.palette.common.white,
                textDecoration: 'none',
                borderBottom: '1px dashed',
                borderBottomColor: theme.palette.common.white,
                padding: '3px',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              {user.email}
            </MuiLink>
          ) : (
            <MuiLink
              data-cy="active-user-profile"
              component={Link}
              to={`/ProfilePage/${user.id}`}
              sx={{
                color: theme.palette.common.white,
                textDecoration: 'none',
                borderBottom: '1px dashed',
                borderBottomColor: theme.palette.common.white,
                padding: '3px',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              {user.email}
            </MuiLink>
          )}
          {roles.length > 1 && ` (${humanReadableActiveRole})`}
        </Box>
        <AccountActionButton />
      </Toolbar>
    </AppBar>
  );
};

AppToolbar.propTypes = {
  open: PropTypes.bool.isRequired,
  handleDrawerOpen: PropTypes.func.isRequired,
};

export default AppToolbar;
