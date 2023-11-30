import Grid from '@mui/material/Grid';
import React from 'react';
import { NumberParam, useQueryParams, withDefault } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import { Fap } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';

import FapProposalsAndAssignmentsTable from './FapProposalsAndAssignmentsTable';

type FapProposalsAndAssignmentsProps = {
  /** Id of the Fap we are assigning members to */
  data: Fap;
  onFapUpdate: (fap: Fap) => void;
};

const FapProposalsAndAssignments = ({
  data: fapData,
  onFapUpdate,
}: FapProposalsAndAssignmentsProps) => {
  const { loadingCalls, calls } = useCallsData({ fapIds: [fapData.id] });
  // NOTE: Default null means load all calls if nothing is selected
  const [query] = useQueryParams({
    call: withDefault(NumberParam, null),
  });

  return (
    <>
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallFilter
            calls={calls}
            isLoading={loadingCalls}
            shouldShowAll={true}
            callId={query.call}
          />
        </Grid>
      </Grid>
      <FapProposalsAndAssignmentsTable
        data={fapData}
        onAssignmentsUpdate={onFapUpdate}
        selectedCallId={query.call}
      />
    </>
  );
};

export default FapProposalsAndAssignments;
