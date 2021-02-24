import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import { withRouter } from 'react-router-dom';

import SimpleTabs from 'components/common/TabPanel';
import EventLogList from 'components/eventLog/EventLogList';

import { getTheme } from '../../theme';
import { Impersonate } from './Impersonate';
import UpdatePassword from './UpdatePassword';
import UpdateUserInformation from './UpdateUserInformation';
import UpdateUserRoles from './UpdateUserRoles';

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
    <Container maxWidth="lg" cy-data="user-page">
      <SimpleTabs tabNames={['General', 'Settings', 'Logs']}>
        <UpdateUserInformation id={userId} />
        <React.Fragment>
          <UpdatePassword id={userId} />
          <Divider className={classes.divider} />
          <UpdateUserRoles id={userId} />
          <Divider className={classes.divider} />
          <Impersonate id={userId} />
        </React.Fragment>
        <EventLogList
          eventType="USER | EMAIL_INVITE"
          changedObjectId={userId}
        />
      </SimpleTabs>
    </Container>
  );
}

export default withRouter(UserPage);
