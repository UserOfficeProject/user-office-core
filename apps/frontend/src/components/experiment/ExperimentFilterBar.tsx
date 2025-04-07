import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { useCallsData } from 'hooks/call/useCallsData';
import { useInstrumentsMinimalData } from 'hooks/instrument/useInstrumentsMinimalData';

import DateFilter from './DateFilter';

function ExperimentFilterBar() {
  const [searchParams, setSearchParam] = useSearchParams();
  const call = searchParams.get('call');
  const instrument = searchParams.get('instrument');
  const experimentFromDate = searchParams.get('from');
  const experimentToDate = searchParams.get('to');

  const { instruments, loadingInstruments } = useInstrumentsMinimalData();
  const { calls, loadingCalls } = useCallsData();

  const handleOnChange = (format: string, from?: Date, to?: Date) => {
    setSearchParam((searchParam) => {
      searchParam.delete('from');
      searchParam.delete('to');

      if (from) {
        searchParam.set('from', DateTime.fromJSDate(from).toFormat(format));
      }

      if (to) {
        searchParam.set('to', DateTime.fromJSDate(to).toFormat(format));
      }

      return searchParam;
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item sm={3} xs={12}>
        <CallFilter
          callId={call ? +call : null}
          calls={calls}
          isLoading={loadingCalls}
          shouldShowAll={true}
          data-cy="call-filter"
        />
      </Grid>
      <Grid item sm={3} xs={12}>
        <InstrumentFilter
          instrumentId={instrument ? +instrument : null}
          instruments={instruments}
          isLoading={loadingInstruments}
          shouldShowAll={true}
          data-cy="instrument-filter"
        />
      </Grid>
      <Grid item xs={12}>
        <DateFilter
          from={experimentFromDate ?? undefined}
          to={experimentToDate ?? undefined}
          onChange={handleOnChange}
          data-cy="date-filter"
        />
      </Grid>
    </Grid>
  );
}

export default ExperimentFilterBar;
