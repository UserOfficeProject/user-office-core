import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { NumberParam, useQueryParams, withDefault } from 'use-query-params';

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
  const [query, setQuery] = useQueryParams({
    call: withDefault(NumberParam, null),
  });

  useEffect(() => {
    if (calls.length && !query.call) {
      setQuery({ call: calls[0].id });
    }
  }, [calls, query.call, setQuery]);

  const selectedCall = calls.find((call) => call.id === query.call);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallFilter
            calls={calls}
            isLoading={loadingCalls}
            callId={query.call}
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
