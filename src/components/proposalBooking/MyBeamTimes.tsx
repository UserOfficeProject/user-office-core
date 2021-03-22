import Grid from '@material-ui/core/Grid';
import React from 'react';

import { useProposalBookingsScheduledEvents } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import BeamTimesTable from './BeamTimesTable';

export default function MyBeamTimes() {
  const {
    loading,
    proposalScheduledEvents,
  } = useProposalBookingsScheduledEvents();

  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper margin={[0]}>
            <BeamTimesTable
              isLoading={loading}
              proposalScheduledEvents={proposalScheduledEvents}
              title="My beam times"
              options={{
                search: true,
                padding: 'default',
                emptyRowsWhenPaging: true,
                paging: true,
              }}
            />
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}
