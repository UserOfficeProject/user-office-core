import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { ExperimentsFilter, WorkflowType } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsMinimalData } from 'hooks/instrument/useInstrumentsMinimalData';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import ExperimentFilterBar from './ExperimentFilterBar';
import ExperimentsTable from './ExperimentsTable';

function ExperimentsPage() {
  const [searchParams] = useSearchParams();

  const callId = searchParams.get('call');
  const instrumentId = searchParams.get('instrument');

  const [experimentsFilter, setExperimentsFilter] =
    React.useState<ExperimentsFilter>({
      callId: callId ? +callId : undefined,
      instrumentId: instrumentId ? +instrumentId : undefined,
    });

  const { calls, loadingCalls } = useCallsData();
  const { instruments, loadingInstruments } = useInstrumentsMinimalData();
  const {
    statuses: experimentStatuses,
    loadingStatuses: loadingExperimentStatuses,
  } = useStatusesData(WorkflowType.EXPERIMENT);

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper data-cy="officer-scheduled-events-table">
        <ExperimentFilterBar
          calls={{ data: calls, isLoading: loadingCalls }}
          instruments={{
            data: instruments,
            isLoading: loadingInstruments,
          }}
          experimentStatuses={{
            data: experimentStatuses,
            isLoading: loadingExperimentStatuses,
          }}
          setExperimentFilter={setExperimentsFilter}
          filter={experimentsFilter}
        />
        <ExperimentsTable
          experimentsFilter={experimentsFilter}
          setExperimentsFilter={setExperimentsFilter}
        />
      </StyledPaper>
    </StyledContainer>
  );
}

export default ExperimentsPage;
