import { Badge, BadgeProps, makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import FlightTakeoffIcon from '@material-ui/icons/FlightTakeoff';
import GroupIcon from '@material-ui/icons/Group';
import SchoolIcon from '@material-ui/icons/School';
import MaterialTable from 'material-table';
import React from 'react';
import { useHistory } from 'react-router';

import { useProposalBookingsScheduledEvents } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { StyledPaper } from 'styles/StyledComponents';
import { tableIcons } from 'utils/materialIcons';
import {
  parseTzLessDateTime,
  TZ_LESS_DATE_TIME_LOW_PREC_FORMAT,
} from 'utils/Time';

import BoxIcon from '../common/icons/BoxIcon';

const useStyles = makeStyles(() => ({
  completed: {
    color: '#000',
  },
  active: {
    color: '#000',
    '& .MuiBadge-dot': {
      background: 'red',
    },
  },
  inactive: {
    color: '#BBB',
    pointerEvents: 'none',
  },
}));

function DotBadge({ children, ...rest }: BadgeProps) {
  return (
    <Badge variant="dot" overlap="circle" {...rest}>
      {children}
    </Badge>
  );
}

interface ActionButtonProps {
  children: React.ReactNode;
  variant: 'completed' | 'active' | 'inactive';
}
function ActionButton({ children, variant: state }: ActionButtonProps) {
  const classes = useStyles();

  switch (state) {
    case 'completed':
      return <DotBadge className={classes.completed}>{children}</DotBadge>;
    case 'active':
      return <DotBadge className={classes.active}>{children}</DotBadge>;
    case 'inactive':
      return <DotBadge className={classes.inactive}>{children}</DotBadge>;
  }
}

export default function UserUpcomingExperimentsTable() {
  const history = useHistory();

  const {
    loading,
    proposalScheduledEvents,
  } = useProposalBookingsScheduledEvents({
    onlyUpcoming: true,
    notDraft: true,
  });

  // if there are no upcoming experiments
  // just hide the whole table altogether
  if (proposalScheduledEvents.length === 0) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <StyledPaper margin={[0]}>
        <MaterialTable
          actions={[
            {
              tooltip: 'Define who is coming',
              // eslint-disable-next-line
              icon: () => (
                <ActionButton variant="inactive">
                  <GroupIcon />
                </ActionButton>
              ),

              onClick: () => {
                /* TODO */
              },
            },
            (rowData) => {
              const variant = rowData.proposal.visits ? 'completed' : 'active';

              return {
                tooltip: 'Define your own visit',
                // eslint-disable-next-line
                icon: () => (
                  <ActionButton variant={variant}>
                    <FlightTakeoffIcon />
                  </ActionButton>
                ),
                onClick: () => {
                  history.push('/MyVisits');
                },
              };
            },
            {
              tooltip: 'Finish individual training',
              // eslint-disable-next-line
              icon: () => (
                <ActionButton variant="inactive">
                  <SchoolIcon />
                </ActionButton>
              ),
              onClick: () => {
                /* TODO */
              },
            },
            {
              tooltip: 'Finish risk assessment',
              // eslint-disable-next-line
              icon: () => (
                <ActionButton variant="inactive">
                  <BoxIcon />
                </ActionButton>
              ),
              onClick: () => {
                /* TODO */
              },
            },
          ]}
          icons={tableIcons}
          title="Upcoming experiments"
          isLoading={loading}
          columns={[
            { title: 'Proposal title', field: 'proposal.title' },
            { title: 'Proposal ID', field: 'proposal.proposalId' },
            {
              title: 'Starts at',
              field: 'startsAt',
              render: (rowData) =>
                parseTzLessDateTime(rowData.startsAt).format(
                  TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
                ),
            },
            {
              title: 'Ends at',
              field: 'endsAt',
              render: (rowData) =>
                parseTzLessDateTime(rowData.endsAt).format(
                  TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
                ),
            },
          ]}
          data={proposalScheduledEvents}
          options={{
            search: false,
            selection: false,
            padding: 'dense',
            emptyRowsWhenPaging: false,
            paging: false,
            actionsColumnIndex: -1,
          }}
        />
      </StyledPaper>
    </Grid>
  );
}
