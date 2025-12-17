import { ListItemText } from '@mui/material';
import React from 'react';

import { BasicUserDetails } from 'generated/sdk';
import { getFullUserName } from 'utils/user';

interface UserListItemProps {
  user?: BasicUserDetails | null;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  return (
    <ListItemText
      primary={getFullUserName(user)}
      secondary={user?.institution || ''}
      primaryTypographyProps={{ variant: 'body2' }}
      secondaryTypographyProps={{ variant: 'caption' }}
    />
  );
};

export default UserListItem;
