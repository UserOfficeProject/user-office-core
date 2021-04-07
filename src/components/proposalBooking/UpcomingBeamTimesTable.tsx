import Grid from '@material-ui/core/Grid';
import React from 'react';

import { useProposalBookingsScheduledEvents } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { StyledPaper } from 'styles/StyledComponents';

import BeamTimesTable from './BeamTimesTable';

export default function UpcomingBeamTimesTable() {
  const {
    loading,
    proposalScheduledEvents,
  } = useProposalBookingsScheduledEvents(true);

  // if there are no upcoming beam times
  // just hide the whole table altogether
  if (proposalScheduledEvents.length === 0) {
    return null;
  }

  return (
    <Grid item xs={12}>
      <StyledPaper margin={[0]}>
        <BeamTimesTable
          isLoading={loading}
          proposalScheduledEvents={proposalScheduledEvents}
          title="Upcoming beam times"
        />
      </StyledPaper>
    </Grid>
  );
}
