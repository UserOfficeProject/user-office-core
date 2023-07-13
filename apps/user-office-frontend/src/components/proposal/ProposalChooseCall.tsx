import NavigateNext from '@mui/icons-material/NavigateNext';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Fragment, useContext } from 'react';
import { useHistory } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import { Call } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { timeRemaining } from 'utils/Time';

const useStyles = makeStyles(() => ({
  date: {
    display: 'block',
    fontStyle: 'italic',
  },
}));

type ProposalChooseCallProps = {
  callsData: Call[];
};

const ProposalChooseCall = ({ callsData }: ProposalChooseCallProps) => {
  const history = useHistory();
  const classes = useStyles();
  const { toFormattedDateTime } = useFormattedDateTime();
  const { isInternalUser } = useContext(UserContext);

  const handleSelect = (callId: number, templateId: number | null) => {
    const url = `/ProposalCreate/${callId}/${templateId}`;
    history.push(url);
  };

  return (
    <StyledContainer>
      <StyledPaper>
        <Typography variant="h6" component="h2" gutterBottom>
          Select a call
        </Typography>
        <List data-cy="call-list">
          {callsData.map((call) => {
            const timeRemainingText = timeRemaining(new Date(call.endCall));
            const InternalCalltimeRemainingText = timeRemaining(
              new Date(call.endCallInternal)
            );

            const timeRemainFormatter = (timeText: string) =>
              timeText != '' ? `(${timeText})` : timeText;

            const header =
              call.title === null || call.title === '' ? (
                <Typography variant="h6" component="h3">
                  {call.shortCode}
                </Typography>
              ) : (
                <Typography variant="h6" component="h3">
                  {call.title} <small> ({call.shortCode}) </small>
                </Typography>
              );

            return (
              <ListItem
                button
                key={call.id}
                onClick={() => handleSelect(call.id, call.templateId)}
                divider={true}
              >
                <ListItemText
                  primary={header}
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <>
                      <Typography component="p" className={classes.date}>
                        {`Application deadline: ${toFormattedDateTime(
                          call.endCall
                        )} ${timeRemainFormatter(timeRemainingText)}`}
                      </Typography>

                      {isInternalUser && (
                        <Typography component="p" className={classes.date}>
                          {`Internal deadline:  ${toFormattedDateTime(
                            call.endCallInternal
                          )}
                        ${timeRemainFormatter(InternalCalltimeRemainingText)}
                        `}
                        </Typography>
                      )}
                      <Typography component="p">{call.description}</Typography>
                      <Typography component="p">{call.cycleComment}</Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label={'Select ' + call.shortCode}
                    onClick={() => handleSelect(call.id, call.templateId)}
                  >
                    <NavigateNext />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </StyledPaper>
    </StyledContainer>
  );
};

ProposalChooseCall.propTypes = {
  callsData: PropTypes.array.isRequired,
};

export default ProposalChooseCall;
