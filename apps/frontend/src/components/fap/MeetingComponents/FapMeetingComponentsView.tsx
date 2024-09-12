import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import { useCallsData } from 'hooks/call/useCallsData';

import FapMeetingInstrumentsTable from './FapMeetingInstrumentsTable';

type FapMeetingComponentsViewProps = {
  fapId: number;
  code: string;
};

const FapMeetingComponentsView = ({
  fapId,
  code,
}: FapMeetingComponentsViewProps) => {
  const { loadingCalls, calls } = useCallsData({ fapIds: [fapId] });

  const [searchParams, setSearchParams] = useSearchParams();

  const call = searchParams.get('call');

  useEffect(() => {
    if (calls.length && !call) {
      setSearchParams((searchParams) => {
        searchParams.set('call', calls[0].id.toString());

        return searchParams;
      });
    }
  }, [call, calls, setSearchParams]);

  const selectedCall = calls.find((call) => call && call.id === +call);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallFilter
            calls={calls}
            isLoading={loadingCalls}
            callId={call ? +call : null}
          />
        </Grid>
      </Grid>
      {selectedCall ? (
        <FapMeetingInstrumentsTable
          fapId={fapId}
          selectedCall={selectedCall}
          code={code}
        />
      ) : null}
    </>
  );
};

FapMeetingComponentsView.propTypes = {
  fapId: PropTypes.number.isRequired,
};

export default FapMeetingComponentsView;
