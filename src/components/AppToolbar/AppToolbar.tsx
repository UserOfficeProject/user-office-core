import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';

import AccountActionButton from './AccountActionButton';

const drawerWidth = 250;

const useStyles = makeStyles((theme) => ({
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  profileLink: {
    color: theme.palette.common.white,
    textDecoration: 'none',
    borderBottom: '1px dashed',
    borderBottomColor: theme.palette.common.white,
    padding: '3px',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  horizontalSpacing: {
    margin: theme.spacing(0, 0.5),
  },
}));

type AppToolbarProps = {
  /** Content of the information modal. */
  open: boolean;
  /** Text of the button link in the information modal. */
  handleDrawerOpen: () => void;
};

const AppToolbar: React.FC<AppToolbarProps> = ({ open, handleDrawerOpen }) => {
  const classes = useStyles();
  const { user, roles, currentRole } = useContext(UserContext);
  const humanReadableActiveRole = useMemo(
    () =>
      roles.find(({ shortCode }) => shortCode.toUpperCase() === currentRole)
        ?.title ?? 'Unknown',
    [roles, currentRole]
  );

  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, open && classes.appBarShift)}
    >
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="Open drawer"
          onClick={handleDrawerOpen}
          className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          className={classes.title}
        >
          User Office
        </Typography>
        <div className={classes.horizontalSpacing}>
          Logged in as{' '}
          <MuiLink
            data-cy="active-user-profile"
            component={Link}
            to={`/ProfilePage/${user.id}`}
            className={classes.profileLink}
          >
            {user.email}
          </MuiLink>
          {roles.length > 1 && ` (${humanReadableActiveRole})`}
        </div>
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
