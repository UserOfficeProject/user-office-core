import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import React, { useMemo } from 'react';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { useCallsData } from 'hooks/call/useCallsData';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
import { useInstrumentsMinimalData } from 'hooks/instrument/useInstrumentsMinimalData';

import DateFilter from './DateFilter';

function ExperimentFilterBar() {
  const initialParams = useMemo(
    () => ({
      call: null,
      instrument: null,
      from: null,
      to: null,
    }),
    []
  );

  const [typedParams, setTypedParams] = useTypeSafeSearchParams<{
    call: string | null;
    instrument: string | null;
    from: string | null;
    to: string | null;
  }>(initialParams);
  const call = typedParams.call;
  const instrument = typedParams.instrument;
  const experimentFromDate = typedParams.from;
  const experimentToDate = typedParams.to;

  const { instruments, loadingInstruments } = useInstrumentsMinimalData();
  const { calls, loadingCalls } = useCallsData();

  const handleOnChange = (format: string, from?: Date, to?: Date) => {
    setTypedParams((prev) => ({
      ...prev,
      from: from ? DateTime.fromJSDate(from).toFormat(format) : null,
      to: to ? DateTime.fromJSDate(to).toFormat(format) : null,
    }));
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
