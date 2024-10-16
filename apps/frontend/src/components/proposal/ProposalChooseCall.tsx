import NavigateNext from '@mui/icons-material/NavigateNext';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React, { Fragment, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { CallsFilter } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useMinimalCallsData } from 'hooks/call/useMinimalCallsData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import { timeRemaining } from 'utils/Time';

const ProposalChooseCall = () => {
  const navigate = useNavigate();
  const { toFormattedDateTime } = useFormattedDateTime();
  const { isInternalUser } = useContext(UserContext);

  const handleSelect = (callId: number, templateId: number | null) => {
    const url = `/ProposalCreate/${callId}/${templateId}`;
    navigate(url);
  };
  function getDashBoardCallFilter(): CallsFilter {
    return isInternalUser
      ? {
          isActive: true,
          isEnded: false,
          isActiveInternal: true,
        }
      : {
          isActive: true,
          isEnded: false,
        };
  }
  const { calls } = useMinimalCallsData(getDashBoardCallFilter());

  return (
    <StyledContainer>
      <StyledPaper>
        <Typography variant="h6" component="h2" gutterBottom>
          Select a call
        </Typography>
        <List data-cy="call-list">
          {calls.map((call) => {
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
              <ListItemButton
                key={call.id}
                onClick={() => handleSelect(call.id, call.templateId)}
                divider={true}
                component="li"
              >
                <ListItemText
                  primary={header}
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <>
                      <Typography
                        component="p"
                        sx={{
                          display: 'block',
                          fontStyle: 'italic',
                        }}
                      >
                        {`Application deadline: ${toFormattedDateTime(
                          call.endCall
                        )} ${timeRemainFormatter(timeRemainingText)}`}
                      </Typography>

                      {isInternalUser && (
                        <Typography
                          component="p"
                          sx={{
                            display: 'block',
                            fontStyle: 'italic',
                          }}
                        >
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
              </ListItemButton>
            );
          })}
        </List>
      </StyledPaper>
    </StyledContainer>
  );
};

export default ProposalChooseCall;
