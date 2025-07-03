import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  CallFilter,
  DateFilter,
  ExperimentSafetyStatusFilter,
  InstrumentFilter,
} from 'components/common/experimentFilters';
import { Call, InstrumentMinimalFragment, Status } from 'generated/sdk';

import { ExperimentsFilter } from '../experiment/ExperimentsPage';

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
  const experimentStartDate = searchParams.get('experimentStartDate');
  const experimentEndDate = searchParams.get('experimentEndDate');

  const handleOnChange = (
    format: string,
    experimentStartDate?: Date,
    experimentEndDate?: Date
  ) => {
    setSearchParam((searchParam) => {
      searchParam.delete('experimentStartDate');
      searchParam.delete('experimentEndDate');

      if (experimentStartDate) {
        searchParam.set(
          'experimentStartDate',
          DateTime.fromJSDate(experimentStartDate).toFormat(format)
        );
      }

      if (experimentEndDate) {
        searchParam.set(
          'experimentEndDate',
          DateTime.fromJSDate(experimentEndDate).toFormat(format)
        );
      }

      return searchParam;
    });

    // Update the filter with the new experimentStartDate and experimentEndDate
    setExperimentFilter({
      ...filter,
      experimentStartDate: experimentStartDate,
      experimentEndDate: experimentEndDate,
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
        <ExperimentSafetyStatusFilter
          statusId={filter.experimentSafetyStatusId as number}
          statuses={experimentStatuses?.data}
          isLoading={experimentStatuses?.isLoading}
          shouldShowAll={true}
          hiddenStatuses={[]}
          onChange={(experimentSafetyStatusId: number) => {
            setExperimentFilter({
              ...filter,
              experimentSafetyStatusId,
            });
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <DateFilter
          experimentStartDate={experimentStartDate ?? undefined}
          experimentEndDate={experimentEndDate ?? undefined}
          onChange={handleOnChange}
          data-cy="date-filter"
        />
      </Grid>
    </Grid>
  );
}

export default ExperimentFilterBar;
