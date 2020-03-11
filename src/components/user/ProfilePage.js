import React from 'react';
import UpdateUserInformation from './UpdateUserInformation';
import UpdatePassword from './UpdatePassword';
import SimpleTabs from '../common/TabPanel';
import { Container } from '@material-ui/core';

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
