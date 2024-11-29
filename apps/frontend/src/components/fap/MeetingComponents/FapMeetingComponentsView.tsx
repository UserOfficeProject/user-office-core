import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import { useCallsData } from 'hooks/call/useCallsData';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';

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

  const initialParams = useMemo(
    () => ({
      call: null,
    }),
    []
  );

  const [typedParams, setTypedParams] = useTypeSafeSearchParams<{
    call: string | null;
  }>(initialParams);

  const { call } = typedParams;
  useEffect(() => {
    if (calls.length && !call) {
      setTypedParams((prev) => ({
        ...prev,
        call: calls[0].id.toString(),
      }));
    }
  }, [call, calls, setTypedParams]);

  const selectedCall = calls.find((c) => call && c.id === +call);

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
