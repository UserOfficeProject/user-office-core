import { Button, Collapse, List, ListItem, styled } from '@mui/material';
import React, { useState } from 'react';

import { BasicUserDetails } from 'generated/sdk';

import UserListItem from './UserListItem';

interface UserListProps {
  users: BasicUserDetails[];
  initVisibleItems?: number;
}

const StyledList = styled(List)(() => ({
  padding: 0,
  '& .MuiListItem-root': {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

const UserList: React.FC<UserListProps> = ({ users, initVisibleItems = 4 }) => {
  const [showAll, setShowAll] = useState(false);

  if (!users || users.length === 0) {
    return null;
  }

  const initialUsers = users.slice(0, initVisibleItems);
  const hiddenUsers = users.slice(initVisibleItems);
  const hasMore = users.length > initVisibleItems;

  return (
    <div data-cy="user-list">
      <StyledList>
        {initialUsers.map((user) => (
          <ListItem key={user.id} disableGutters>
            <UserListItem user={user} />
          </ListItem>
        ))}
      </StyledList>
      <Collapse in={showAll}>
        <StyledList>
          {hiddenUsers.map((user) => (
            <ListItem key={user.id} disableGutters>
              <UserListItem user={user} />
            </ListItem>
          ))}
        </StyledList>
      </Collapse>
      {hasMore && (
        <Button
          onClick={() => setShowAll(!showAll)}
          variant="text"
          size="small"
          data-cy={showAll ? 'show-less-users-btn' : 'show-more-users-btn'}
          sx={{ paddingLeft: 0, textTransform: 'none' }}
        >
          {showAll ? 'Show less...' : 'Show more...'}
        </Button>
      )}
    </div>
  );
};

export default UserList;
