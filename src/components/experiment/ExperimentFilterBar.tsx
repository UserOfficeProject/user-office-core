import React from 'react';
import { DateParam, NumberParam, useQueryParams } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';

import DateFilter from './DateFilter';
import { ExperimentUrlQueryParamsType } from './ExperimentUrlQueryParamsType';

function ExperimentFilterBar() {
  const [urlQueryParams] = useQueryParams<ExperimentUrlQueryParamsType>({
    ...DefaultQueryParams,
    call: NumberParam,
    instrument: NumberParam,
    from: DateParam,
    to: DateParam,
  });

  const { instruments, loadingInstruments } = useInstrumentsData();
  const { calls, loadingCalls } = useCallsData();

  return (
    <>
      <CallFilter
        callId={urlQueryParams.call ?? null}
        calls={calls}
        isLoading={loadingCalls}
        shouldShowAll={true}
        data-cy="call-filter"
      />

      <InstrumentFilter
        instrumentId={urlQueryParams.instrument ?? undefined}
        instruments={instruments}
        isLoading={loadingInstruments}
        shouldShowAll={true}
        data-cy="instrument-filter"
      />

      <DateFilter
        from={urlQueryParams.from ?? undefined}
        to={urlQueryParams.to ?? undefined}
        data-cy="date-filter"
      />
    </>
  );
}

export default ExperimentFilterBar;
