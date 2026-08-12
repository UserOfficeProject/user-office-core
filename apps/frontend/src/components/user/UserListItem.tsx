import { ListItemText } from '@mui/material';
import React from 'react';

import { BasicUserDetails } from 'generated/sdk';
import { getFullUserNameWithEmail } from 'utils/user';

interface UserListItemProps {
  user?: BasicUserDetails | null;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  return (
    <ListItemText
      primary={getFullUserNameWithEmail(user)}
      secondary={`${user?.institution || ''} , ${user?.country || ''}`}
      slotProps={{
        primary: { variant: 'body2' },
        secondary: { variant: 'caption' },
      }}
    />
  );
};

export default UserListItem;
