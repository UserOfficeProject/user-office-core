import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect } from 'react';
import { Redirect, useLocation } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';

const useStyles = makeStyles((theme) => ({
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

function checkAuthRedirect(authRedirect: string): boolean {
  try {
    new URL(authRedirect);

    return true;
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
