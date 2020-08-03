import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { NavigateNext } from '@material-ui/icons';
import dateformat from 'dateformat';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { useHistory } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { Call } from 'generated/sdk';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';
import { daysRemaining } from 'utils/Time';

const useStyles = makeStyles(() => ({
  date: {
    display: 'block',
    fontStyle: 'italic',
  },
}));

type ProposalChooseCallProps = {
  callsData: Call[];
  loadingCalls: boolean;
};

const ProposalChooseCall: React.FC<ProposalChooseCallProps> = ({
  callsData,
  loadingCalls,
}) => {
  const history = useHistory();
  const classes = useStyles();

  if (loadingCalls) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  if (callsData.length === 0) {
    return <p>There are no available calls at the moment</p>;
  }

  const handleSelect = (callId: number) => {
    const url = '/ProposalCreate/' + callId;
    history.push(url);
  };

  const formatDate = (date: Date) => {
    return dateformat(new Date(date), 'dd-mmm-yyyy');
  };

  return (
    <ContentContainer>
      <StyledPaper margin={[0]}>
        <Typography variant="h6" gutterBottom>
          Select a call
        </Typography>
        <List>
          {callsData.map(call => {
            const daysRemainingNum = daysRemaining(new Date(call.endCall));
            const daysRemainingText =
              daysRemainingNum > 0 && daysRemainingNum < 30
                ? `(${daysRemainingNum} days remaining)`
                : '';

            return (
              <ListItem
                button
                key={call.id}
                onClick={() => handleSelect(call.id)}
                divider={true}
              >
                <ListItemText
                  primary={
                    <Typography variant="h6">{call.shortCode}</Typography>
                  }
                  secondary={
                    <Fragment>
                      <Typography component="span" className={classes.date}>
                        {`Application deadline: ${formatDate(
                          call.endCall
                        )} ${daysRemainingText}`}
                      </Typography>
                      <Typography component="span">
                        {call.cycleComment}
                      </Typography>
                    </Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="comments"
                    onClick={() => handleSelect(call.id)}
                  >
                    <NavigateNext />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </StyledPaper>
    </ContentContainer>
  );
};

ProposalChooseCall.propTypes = {
  callsData: PropTypes.array.isRequired,
  loadingCalls: PropTypes.bool.isRequired,
};

export default ProposalChooseCall;
