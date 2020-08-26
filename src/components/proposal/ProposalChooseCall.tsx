import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import NavigateNext from '@material-ui/icons/NavigateNext';
import dateformat from 'dateformat';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { useHistory } from 'react-router';

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
};

const getDaysRemainingText = (daysRemaining: number) => {
  if (daysRemaining <= 1) {
    return '(last day remaining)';
  } else if (daysRemaining > 1 && daysRemaining < 30) {
    return `(${daysRemaining} days remaining)`;
  } else {
    return '';
  }
};

const ProposalChooseCall: React.FC<ProposalChooseCallProps> = ({
  callsData,
}) => {
  const history = useHistory();
  const classes = useStyles();

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
            const daysRemainingText = getDaysRemainingText(daysRemainingNum);

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
};

export default ProposalChooseCall;
