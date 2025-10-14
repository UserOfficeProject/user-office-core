import Grid from '@mui/material/Grid';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import InstrumentFilter from 'components/common/proposalFilters/InstrumentFilter';
import { Fap } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { useFapProposalsData } from 'hooks/fap/useFapProposalsData';
import { useFapInstruments } from 'hooks/instrument/useFapInstruments';

import FapLegacyProposalsTable from './FapLegacyProposalsTable';

type LegacyFapProposalsProps = {
  /** Id of the Fap we are assigning members to */
  data: Fap;
  onFapUpdate: (fap: Fap) => void;
};

const LegacyFapProposals = ({
  data: fapData,
  onFapUpdate,
}: LegacyFapProposalsProps) => {
  const { loadingCalls, calls } = useCallsData({
    fapIds: [fapData.id],
    isFapReviewEnded: true,
  });
  // NOTE: Default null means load all calls if nothing is selected
  const { loadingInstruments, instruments } = useFapInstruments(
    fapData.id,
    null
  );

  // Refech fap proposals too keep more the commenly used current fap proposals in memory

  const [searchParams] = useSearchParams();
  const call = searchParams.get('call');
  const instrument = searchParams.get('instrument');

  const { loadingFapProposals, FapProposalsData, setFapProposalsData } =
    useFapProposalsData(
      fapData.id,
      call ? parseInt(call) : null,
      instrument ? parseInt(instrument) : null,
      true // legacy flag set to true
    );

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
      <FapLegacyProposalsTable
        data={fapData}
        onAssignmentsUpdate={onFapUpdate}
        selectedCallId={call ? +call : null}
        selectedInstrumentId={instrument ? +instrument : null}
        fapProposals={{
          loadingFapProposals,
          FapProposalsData,
          setFapProposalsData,
        }}
      />
    </>
  );
};

export default LegacyFapProposals;
