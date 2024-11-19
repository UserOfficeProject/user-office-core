import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { useInstrumentsMinimalData } from 'hooks/instrument/useInstrumentsMinimalData';
import { useProposalBookingsScheduledEvents } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentsTable from './ExperimentTimesTable';

export default function InstrSciUpcomingExperimentTimesTable() {
  const [searchParams] = useSearchParams();
  const instrumentId = searchParams.get('instrument');

  const { instruments, loadingInstruments } = useInstrumentsMinimalData();

  const [selectedInstrumentId, setSelectedInstrumentId] = useState<
    number | null | undefined
  >(instrumentId ? +instrumentId : null);

  const { loading, proposalScheduledEvents } =
    useProposalBookingsScheduledEvents({
      onlyUpcoming: true,
      notDraft: true,
      instrumentId: selectedInstrumentId,
    });

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <InstrumentFilter
          shouldShowAll
          instruments={instruments}
          isLoading={loadingInstruments}
          instrumentId={selectedInstrumentId}
          onChange={(instrumentFilter) => {
            setSelectedInstrumentId(instrumentFilter.instrumentId);
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
    </StyledContainer>
  );
}
