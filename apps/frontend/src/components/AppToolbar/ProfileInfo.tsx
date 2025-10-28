// react functional component

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { getFullUserName } from 'utils/user';

const ProfileInfo = () => {
  const { user } = useContext(UserContext);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: '15px 30px 15px 15px',
      }}
    >
      <Avatar sx={{ width: 50, height: 50, mr: '15px' }} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          noWrap
          sx={{
            color: 'black',
            fontSize: '18px',
            lineHeight: 1.3,
          }}
        >
          {getFullUserName(user)}
        </Typography>
        {user.email && (
          <Typography
            sx={{
              color: 'dimgray',
              fontSize: '14px',
              lineHeight: 1.3,
            }}
          >
            {user.email.toLocaleLowerCase()}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProfileInfo;
