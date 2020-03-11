import React from 'react';
import { withRouter } from 'react-router-dom';
import UpdateUserInformation from './UpdateUserInformation';
import UpdatePassword from './UpdatePassword';
import UpdateUserRoles from './UpdateUserRoles';
import { Impersonate } from './Impersonate';
import SimpleTabs from '../common/TabPanel';
import EventLogList from '../eventLog/EventLogList';
import { Container } from '@material-ui/core';

function UserPage(props: { match: { params: { id: string } } }) {
  const userId = parseInt(props.match.params.id);

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['General', 'Settings', 'Logs']}>
        <UpdateUserInformation id={userId} />
        <React.Fragment>
          <UpdatePassword id={userId} />
          <UpdateUserRoles id={userId} />
          <Impersonate id={userId} />
        </React.Fragment>
        <EventLogList eventType="USER" changedObjectId={userId} />
      </SimpleTabs>
    </Container>
  );
}

export default withRouter(UserPage);
