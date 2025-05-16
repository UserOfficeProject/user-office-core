import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import StatusFilter from 'components/common/proposalFilters/StatusFilter';
import {
  Call,
  ExperimentsFilter,
  InstrumentMinimalFragment,
  Status,
} from 'generated/sdk';

import DateFilter from './DateFilter';

type ExperimentFilterBarProps = {
  calls?: {
    data: Pick<Call, 'shortCode' | 'id' | 'templateId'>[];
    isLoading: boolean;
  };
  instruments?: { data: InstrumentMinimalFragment[]; isLoading: boolean };
  experimentStatuses?: { data: Status[]; isLoading: boolean };
  setExperimentFilter: (filter: ExperimentsFilter) => void;
  filter: ExperimentsFilter;
};

function ExperimentFilterBar({
  calls,
  instruments,
  experimentStatuses,
  setExperimentFilter,
  filter,
}: ExperimentFilterBarProps) {
  const [searchParams, setSearchParam] = useSearchParams();
  const experimentFromDate = searchParams.get('from');
  const experimentToDate = searchParams.get('to');

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
      <Grid item sm={4} xs={12}>
        <CallFilter
          callId={filter.callId as number}
          calls={calls?.data}
          isLoading={calls?.isLoading}
          shouldShowAll={true}
          onChange={(callId) => {
            setExperimentFilter({
              ...filter,
              callId,
            });
          }}
        />
      </Grid>
      <Grid item sm={4} xs={12}>
        <InstrumentFilter
          instrumentId={filter.instrumentId}
          instruments={instruments?.data}
          isLoading={instruments?.isLoading}
          shouldShowAll={true}
          onChange={(instrumentFilterValue) => {
            setExperimentFilter({
              ...filter,
              instrumentId: instrumentFilterValue.instrumentId,
            });
          }}
        />
      </Grid>
      <Grid item sm={4} xs={12}>
        <StatusFilter
          statusId={filter.experimentSafetyStatusId as number}
          statuses={experimentStatuses?.data}
          isLoading={experimentStatuses?.isLoading}
          shouldShowAll={true}
          hiddenStatuses={[]}
          onChange={(experimentSafetyStatusId) => {
            setExperimentFilter({
              ...filter,
              experimentSafetyStatusId,
            });
          }}
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
