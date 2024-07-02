import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import React from 'react';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { DefaultQueryParams } from 'components/common/SuperMaterialTable';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';

import DateFilter from './DateFilter';
import { ExperimentUrlQueryParamsType } from './ExperimentUrlQueryParamsType';

function ExperimentFilterBar() {
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<ExperimentUrlQueryParamsType>({
      ...DefaultQueryParams,
      call: NumberParam,
      instrument: NumberParam,
      from: StringParam,
      to: StringParam,
    });

  const { instruments, loadingInstruments } = useInstrumentsData();
  const { calls, loadingCalls } = useCallsData();

  const handleOnChange = (format: string, from?: Date, to?: Date) => {
    setUrlQueryParams({
      ...urlQueryParams,
      from: from ? DateTime.fromJSDate(from).toFormat(format) : undefined,
      to: to ? DateTime.fromJSDate(to).toFormat(format) : undefined,
    });
  };

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
          onChange={handleOnChange}
          data-cy="date-filter"
        />
      </Grid>
    </Grid>
  );
}

export default ExperimentFilterBar;
