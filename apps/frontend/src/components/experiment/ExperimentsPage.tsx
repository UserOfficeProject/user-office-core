import { DateTime } from 'luxon';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ExperimentsFilter as BaseExperimentsFilter,
  SettingsId,
  WorkflowType,
} from 'generated/sdk';
export interface ExperimentsFilter extends BaseExperimentsFilter {
  experimentStartDate?: DateTime;
  experimentEndDate?: DateTime;
}
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsMinimalData } from 'hooks/instrument/useInstrumentsMinimalData';
import { useStatusesData } from 'hooks/settings/useStatusesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import { DEFAULT_DATE_FORMAT } from './DateFilter';
import ExperimentFilterBar from './ExperimentFilterBar';
import ExperimentsTable from './ExperimentsTable';

function ExperimentsPage() {
  const [searchParams] = useSearchParams();

  const callId = searchParams.get('call');
  const instrumentId = searchParams.get('instrument');
  const experimentSafetyStatusId = searchParams.get('experimentSafetyStatus');
  const experimentStartDate = searchParams.get('experimentStartDate');
  const experimentEndDate = searchParams.get('experimentEndDate');

  const { format } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const [experimentsFilter, setExperimentsFilter] =
    React.useState<ExperimentsFilter>({
      callId: callId ? +callId : undefined,
      instrumentId: instrumentId ? +instrumentId : undefined,
      experimentSafetyStatusId: experimentSafetyStatusId
        ? +experimentSafetyStatusId
        : undefined,
      // Set initial values for experiment dates if provided in URL
      experimentStartDate: experimentStartDate
        ? DateTime.fromFormat(
            experimentStartDate,
            format || DEFAULT_DATE_FORMAT
          )
        : undefined,
      experimentEndDate: experimentEndDate
        ? DateTime.fromFormat(
            experimentEndDate,
            format || DEFAULT_DATE_FORMAT
          ).set({ hour: 23, minute: 59, second: 59 })
        : undefined,
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
