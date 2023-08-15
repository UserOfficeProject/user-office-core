import Box from '@mui/material/Box';
import React, { useContext, useEffect } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';

import UOLoader from './UOLoader';

type ChangeRouteStateProps = {
  newToken: string;
};

const ChangeRole = (props: RouteComponentProps) => {
  const { handleNewToken } = useContext(UserContext);
  const history = useHistory();
  const newToken = (props.history.location.state as ChangeRouteStateProps)
    ?.newToken;

  useEffect(() => {
    if (newToken) {
      handleNewToken(newToken);

      history.push('/');
    }
  }, [newToken, handleNewToken, history]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <UOLoader />
      Changing role...
    </Box>
  );
};

export default ChangeRole;
