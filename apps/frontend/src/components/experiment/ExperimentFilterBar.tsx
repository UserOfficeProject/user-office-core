import Grid from '@mui/material/Grid';
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
    <Grid container spacing={2}>
      <Grid item sm={3} xs={12}>
        <CallFilter
          callId={urlQueryParams.call ?? null}
          calls={calls}
          isLoading={loadingCalls}
          shouldShowAll={true}
          data-cy="call-filter"
        />
      </Grid>
      <Grid item sm={3} xs={12}>
        <InstrumentFilter
          instrumentId={urlQueryParams.instrument ?? undefined}
          instruments={instruments}
          isLoading={loadingInstruments}
          shouldShowAll={true}
          data-cy="instrument-filter"
        />
      </Grid>
      <Grid item xs={12}>
        <DateFilter
          from={urlQueryParams.from ?? undefined}
          to={urlQueryParams.to ?? undefined}
          data-cy="date-filter"
        />
      </Grid>
    </Grid>
  );
}

export default ExperimentFilterBar;
