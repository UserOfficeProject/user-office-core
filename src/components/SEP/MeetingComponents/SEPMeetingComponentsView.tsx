import { Options, MTableToolbar } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import CallFilter from 'components/common/proposalFilters/CallFilter';
import { useCallsData } from 'hooks/call/useCallsData';

import SEPMeetingInstrumentsTable from './SEPMeetingInstrumentsTable';

type SEPMeetingComponentsViewProps = {
  sepId: number;
};

const SEPMeetingComponentsView: React.FC<SEPMeetingComponentsViewProps> = ({
  sepId,
}) => {
  const { loadingCalls, calls } = useCallsData();
  // NOTE: Default call is with id=1
  const [selectedCallId, setSelectedCallId] = useState<number>(1);

  const Toolbar = (data: Options): JSX.Element => (
    <>
      <MTableToolbar {...data} />
      <CallFilter
        calls={calls}
        isLoading={loadingCalls}
        onChange={setSelectedCallId}
        callId={selectedCallId}
      />
    </>
  );

  return (
    <SEPMeetingInstrumentsTable
      sepId={sepId}
      Toolbar={Toolbar}
      selectedCallId={selectedCallId}
    />
  );
};

SEPMeetingComponentsView.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPMeetingComponentsView;
