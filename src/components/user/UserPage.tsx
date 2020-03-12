import React from 'react';
import { withRouter } from 'react-router-dom';
import UpdateUserInformation from './UpdateUserInformation';
import UpdatePassword from './UpdatePassword';
import UpdateUserRoles from './UpdateUserRoles';
import { Impersonate } from './Impersonate';
import SimpleTabs from '../common/TabPanel';
import EventLogList from '../eventLog/EventLogList';
import { Container, Divider, makeStyles } from '@material-ui/core';
import { getTheme } from '../../theme';

const useStyles = makeStyles({
  divider: {
    border: 'none',
    height: '25px',
    borderBottom: `1px solid ${getTheme().palette.primary.main}`,
    boxShadow: `0px 5px 10px -10px #000`,
    marginBottom: '16px',
    background: 'none',
  },
});

function UserPage(props: { match: { params: { id: string } } }) {
  const userId = parseInt(props.match.params.id);

  const classes = useStyles();

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['General', 'Settings', 'Logs']}>
        <UpdateUserInformation id={userId} />
        <React.Fragment>
          <UpdatePassword id={userId} />
          <Divider className={classes.divider} />
          <UpdateUserRoles id={userId} />
          <Divider className={classes.divider} />
          <Impersonate id={userId} />
        </React.Fragment>
        <EventLogList eventType="USER" changedObjectId={userId} />
      </SimpleTabs>
    </Container>
  );
}

export default withRouter(UserPage);
