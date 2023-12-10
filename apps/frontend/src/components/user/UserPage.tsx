import React from 'react';
import { withRouter } from 'react-router-dom';

import SimpleTabs from 'components/common/TabPanel';
import EventLogList from 'components/eventLog/EventLogList';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdateUserInformation from './UpdateUserInformation';
import UpdateUserRoles from './UpdateUserRoles';

function UserPage(props: { match: { params: { id: string } } }) {
  const userId = parseInt(props.match.params.id);

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

export default withRouter(UserPage);
