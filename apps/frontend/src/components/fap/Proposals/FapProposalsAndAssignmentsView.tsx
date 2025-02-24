import Grid from '@mui/material/Grid';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { Fap } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useFapInstruments } from 'hooks/instrument/useFapInstruments';

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
  const { loadingInstruments, instruments } = useFapInstruments(
    fapData.id,
    null
  );

  const [searchParams] = useSearchParams();
  const call = searchParams.get('call');
  const instrument = searchParams.get('instrument');

  return (
    <>
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallFilter
            calls={calls}
            isLoading={loadingCalls}
            shouldShowAll={true}
            callId={call ? +call : null}
          />
        </Grid>
        <Grid item sm={3} xs={12}>
          <InstrumentFilter
            instruments={instruments}
            isLoading={loadingInstruments}
            shouldShowAll={true}
            instrumentId={instrument ? +instrument : null}
            data-cy="instrument-filter"
          />
        </Grid>
      </Grid>
      <FapProposalsAndAssignmentsTable
        data={fapData}
        onAssignmentsUpdate={onFapUpdate}
        selectedCallId={call ? +call : null}
        selectedInstrumentId={instrument ? +instrument : null}
      />
    </>
  );
};

export default FapProposalsAndAssignments;
