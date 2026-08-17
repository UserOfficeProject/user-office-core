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
import { CallsFilter, PaginationSortDirection } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { belowCompactUi, minTouchTarget } from 'hooks/common/useResponsive';
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
    return {
      isActive: true,
      isEnded: false,
      isActiveInternal: isInternalUser,
    };
  }
  const { calls } = useCallsData(getDashBoardCallFilter(), {
    sortField: 'sort_order',
    sortDirection: PaginationSortDirection.ASC,
  });

  return (
    <StyledContainer>
      <StyledPaper>
        <Typography variant="h6" component="h2" gutterBottom>
          {calls.length !== 0
            ? 'Select a call'
            : 'There are no calls open at this time'}
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
                sx={(theme) => ({
                  [belowCompactUi(theme)]: {
                    // Keep the text clear of the absolutely positioned chevron.
                    paddingRight: `calc(${minTouchTarget(theme)} + ${theme.spacing(2)})`,
                  },
                })}
              >
                <ListItemText
                  sx={(theme) => ({
                    [belowCompactUi(theme)]: { overflowWrap: 'anywhere' },
                  })}
                  primary={header}
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
                  slotProps={{
                    secondary: { component: 'div' },
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label={'Select ' + call.shortCode}
                    onClick={(event) => {
                      // Without this the click also reaches the row, which
                      // navigates a second time and doubles the history entry.
                      event.stopPropagation();
                      handleSelect(call.id, call.templateId);
                    }}
                    sx={(theme) => ({
                      [belowCompactUi(theme)]: {
                        width: minTouchTarget(theme),
                        height: minTouchTarget(theme),
                      },
                    })}
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
