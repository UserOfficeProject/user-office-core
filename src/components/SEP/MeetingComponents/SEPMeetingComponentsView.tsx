import { Options, MTableToolbar } from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useCallsData } from '../../../hooks/useCallsData';
import SelectedCallFilter from '../../common/SelectedCallFilter';
import SEPMeetingInstrumentsTable from './SEPMeetingInstrumentsTable';

type SEPMeetingComponentsViewProps = {
  sepId: number;
};

const SEPMeetingComponentsView: React.FC<SEPMeetingComponentsViewProps> = ({
  sepId,
}) => {
  const { loading, callsData } = useCallsData();
  // NOTE: Default call is with id=1
  const [selectedCallId, setSelectedCallId] = useState<number>(1);

  const Toolbar = (data: Options): JSX.Element =>
    loading ? (
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
