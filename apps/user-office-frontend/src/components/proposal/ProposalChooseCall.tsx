import NavigateNext from '@mui/icons-material/NavigateNext';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { useHistory } from 'react-router';

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

const ProposalChooseCall: React.FC<ProposalChooseCallProps> = ({
  callsData,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const { toFormattedDateTime } = useFormattedDateTime();

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
            let timeRemainingText = timeRemaining(new Date(call.endCall));
            if (timeRemainingText != '') {
              timeRemainingText = `(${timeRemainingText})`;
            }

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
                        )} ${timeRemainingText}`}
                      </Typography>
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
