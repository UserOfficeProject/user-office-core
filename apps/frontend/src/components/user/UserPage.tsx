import Divider from '@mui/material/Divider';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { withRouter } from 'react-router-dom';

import SimpleTabs from 'components/common/TabPanel';
import EventLogList from 'components/eventLog/EventLogList';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import UpdatePassword from './UpdatePassword';
import UpdateUserInformation from './UpdateUserInformation';
import UpdateUserRoles from './UpdateUserRoles';

const useStyles = makeStyles((theme) => ({
  divider: {
    border: 'none',
    height: '25px',
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    boxShadow: `0px 5px 10px -10px #000`,
    marginBottom: '16px',
    background: 'none',
  },
}));

function UserPage(props: { match: { params: { id: string } } }) {
  const userId = parseInt(props.match.params.id);

  const classes = useStyles();

  return (
    <StyledContainer>
      <StyledPaper cy-data="user-page">
        <SimpleTabs tabNames={['General', 'Settings', 'Logs']}>
          <UpdateUserInformation id={userId} />
          <>
            <UpdatePassword id={userId} />
            <Divider className={classes.divider} />
            <UpdateUserRoles id={userId} />
          </>
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
