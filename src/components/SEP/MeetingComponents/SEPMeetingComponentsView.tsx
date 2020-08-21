import { Options, MTableToolbar } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import SelectedCallFilter from 'components/common/SelectedCallFilter';
import { useCallsData } from 'hooks/call/useCallsData';

import SEPMeetingInstrumentsTable from './SEPMeetingInstrumentsTable';

type SEPMeetingComponentsViewProps = {
  sepId: number;
};

const SEPMeetingComponentsView: React.FC<SEPMeetingComponentsViewProps> = ({
  sepId,
}) => {
  const { loadingCalls, callsData } = useCallsData();
  // NOTE: Default call is with id=1
  const [selectedCallId, setSelectedCallId] = useState<number>(1);

  const Toolbar = (data: Options): JSX.Element =>
    loadingCalls ? (
      <div>Loading...</div>
    ) : (
      <>
        <MTableToolbar {...data} />
        <SelectedCallFilter
          callsData={callsData}
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
