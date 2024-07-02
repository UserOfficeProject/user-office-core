import React from 'react';
import { useParams } from 'react-router-dom';

import NotFound from 'components/common/NotFound';
import SimpleTabs from 'components/common/SimpleTabs';
import EventLogList from 'components/eventLog/EventLogList';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateUserInformation from './UpdateUserInformation';
import UpdateUserRoles from './UpdateUserRoles';

function UserPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <NotFound />;
  }
  const userId = parseInt(id);

  return (
    <StyledContainer>
      <StyledPaper cy-data="user-page">
        <SimpleTabs tabNames={['General', 'Settings', 'Logs']}>
          <UpdateUserInformation id={userId} />
          <UpdateUserRoles id={userId} />
          <EventLogList
            eventType="USER | EMAIL_INVITE"
            changedObjectId={userId}
          />
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}

export default UserPage;
