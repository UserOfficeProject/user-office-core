import { MTableToolbar, Options } from '@material-table/core';
import Grid from '@mui/material/Grid';
import React from 'react';
import { NumberParam, useQueryParams, withDefault } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import { Sep } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';

import SEPProposalsAndAssignmentsTable from './SEPProposalsAndAssignmentsTable';

type SEPProposalsAndAssignmentsProps = {
  /** Id of the SEP we are assigning members to */
  data: Sep;
  onSEPUpdate: (sep: Sep) => void;
};

const SEPProposalsAndAssignments = ({
  data: sepData,
  onSEPUpdate,
}: SEPProposalsAndAssignmentsProps) => {
  const { loadingCalls, calls } = useCallsData({ sepIds: [sepData.id] });
  // NOTE: Default null means load all calls if nothing is selected
  const [query] = useQueryParams({
    call: withDefault(NumberParam, null),
  });

  const Toolbar = (data: Options<JSX.Element>): JSX.Element => (
    <>
      <MTableToolbar {...data} />
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
    </>
  );

  return (
    <SEPProposalsAndAssignmentsTable
      data={sepData}
      onAssignmentsUpdate={onSEPUpdate}
      selectedCallId={query.call}
      Toolbar={Toolbar}
    />
  );
};

export default SEPProposalsAndAssignments;
