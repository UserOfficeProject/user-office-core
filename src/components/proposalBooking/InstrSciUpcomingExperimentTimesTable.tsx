import Grid from '@material-ui/core/Grid';
import React, { useState } from 'react';
import { useQueryParams, NumberParam } from 'use-query-params';

import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useProposalBookingsScheduledEvents } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentsTable from './ExperimentTimesTable';

export default function InstrSciUpcomingExperimentTimesTable() {
  const [urlQueryParams] = useQueryParams({
    instrument: NumberParam,
  });

  const { instruments, loadingInstruments } = useInstrumentsData();

  const [selectedInstrumentId, setSelectedInstrumentId] = useState<number>(
    urlQueryParams.instrument ? urlQueryParams.instrument : 0
  );

  const {
    loading,
    proposalScheduledEvents,
  } = useProposalBookingsScheduledEvents({
    onlyUpcoming: true,
    notDraft: true,
    instrumentId: selectedInstrumentId,
  });

  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <StyledPaper margin={[0]}>
            <InstrumentFilter
              shouldShowAll
              instruments={instruments}
              isLoading={loadingInstruments}
              instrumentId={selectedInstrumentId}
              onChange={(instrumentId) => {
                setSelectedInstrumentId(instrumentId);
              }}
            />
            <ExperimentsTable
              isLoading={loading}
              proposalScheduledEvents={proposalScheduledEvents}
              title="Upcoming experiments"
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
