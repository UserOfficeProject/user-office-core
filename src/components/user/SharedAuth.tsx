import { makeStyles } from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import { Redirect, useLocation } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';

const AUTH_ALLOWED_HOSTNAMES = (
  process.env.REACT_APP_AUTH_ALLOWED_HOSTNAMES || ''
).split(',');

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  message: {
    margin: theme.spacing(2),
    color: theme.palette.grey[700],
  },
}));

function checkAuthRedirect(authRedirect: string) {
  try {
    const url = new URL(authRedirect);

    return AUTH_ALLOWED_HOSTNAMES.some(
      allowedHostname => allowedHostname === url.hostname
    );
  } catch (err) {
    //  malformed URL probably
    console.error(err);

    return false;
  }
}

export default function SharedAuth() {
  const classes = useStyles();
  const { token, handleLogout } = useContext(UserContext);
  const location = useLocation();
  const unauthorizedApi = useUnauthorizedApi();

  const authRedirect = new URLSearchParams(location.search).get('authRedirect');

  useEffect(() => {
    if (!authRedirect) {
      return;
    }

    if (token && checkAuthRedirect(authRedirect)) {
      unauthorizedApi()
        .checkToken({ token })
        .then(({ checkToken: { isValid } }) => {
          if (isValid) {
            window.location.assign(authRedirect);
          } else {
            handleLogout();
          }
        })
        .catch(() => handleLogout());
    }
  }, [token, authRedirect, unauthorizedApi, handleLogout]);

  if (token && authRedirect) {
    return (
      <div className={classes.root}>
        <UOLoader />
        <div className={classes.message}>Please wait</div>
      </div>
    );
  }

  return (
    <Redirect
      to={{
        pathname: '/SignIn',
        search: location.search,
      }}
    />
  );
}
