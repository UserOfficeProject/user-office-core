import { MTableToolbar, Options } from '@material-table/core';
import PropTypes from 'prop-types';
import React from 'react';
import { NumberParam, useQueryParams, withDefault } from 'use-query-params';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import { useCallsData } from 'hooks/call/useCallsData';

import SEPProposalsAndAssignmentsTable from './SEPProposalsAndAssignmentsTable';

type SEPProposalsAndAssignmentsProps = {
  /** Id of the SEP we are assigning members to */
  sepId: number;
};

const SEPProposalsAndAssignments: React.FC<SEPProposalsAndAssignmentsProps> = ({
  sepId,
}) => {
  const { loadingCalls, calls } = useCallsData();
  // NOTE: Default null means load all calls if nothing is selected
  const [query] = useQueryParams({
    call: withDefault(NumberParam, null),
  });

  const Toolbar = (data: Options<JSX.Element>): JSX.Element => (
    <>
      <MTableToolbar {...data} />
      <CallFilter
        calls={calls}
        isLoading={loadingCalls}
        shouldShowAll={true}
        callId={query.call}
      />
    </>
  );

  return (
    <SEPProposalsAndAssignmentsTable
      sepId={sepId}
      selectedCallId={query.call}
      Toolbar={Toolbar}
    />
  );
};

SEPProposalsAndAssignments.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPProposalsAndAssignments;
