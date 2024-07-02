import Box from '@mui/material/Box';
import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';

import UOLoader from './UOLoader';

const ChangeRole = () => {
  const { handleNewToken } = useContext(UserContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const newToken = state.newToken;

  useEffect(() => {
    if (newToken) {
      handleNewToken(newToken);

      navigate('/');
    }
  }, [newToken, handleNewToken, navigate]);

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
