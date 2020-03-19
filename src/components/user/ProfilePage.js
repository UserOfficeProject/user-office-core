import { Container } from '@material-ui/core';
import React from 'react';

import SimpleTabs from '../common/TabPanel';
import UpdatePassword from './UpdatePassword';
import UpdateUserInformation from './UpdateUserInformation';

export default function ProfilePage({ match }) {
  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['General', 'Settings']}>
        <UpdateUserInformation id={parseInt(match.params.id)} />
        <UpdatePassword id={parseInt(match.params.id)} />
      </SimpleTabs>
    </Container>
  );
}
