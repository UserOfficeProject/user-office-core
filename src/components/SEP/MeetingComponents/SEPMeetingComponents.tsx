import { DoneAll } from '@material-ui/icons';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React from 'react';

import { InstrumentWithAvailabilityTime } from '../../../generated/sdk';
import { useInstrumentsBySEPData } from '../../../hooks/useInstrumentsBySEPData';
import { tableIcons } from '../../../utils/materialIcons';
import SEPInstrumentProposalsTable from './SEPInstrumentProposalsTable';

type SEPMeetingComponentsProps = {
  sepId: number;
};

const SEPMeetingComponents: React.FC<SEPMeetingComponentsProps> = ({
  sepId,
}) => {
  // TODO: Make this selectable from a dropdown.
  const selectedCallId = 1;

  const { loadingInstruments, instrumentsData } = useInstrumentsBySEPData(
    sepId,
    selectedCallId
  );

  if (loadingInstruments) {
    return <div>Loading...</div>;
  }

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'Availability time',
      render: (rowData: InstrumentWithAvailabilityTime) =>
        rowData.availabilityTime ? rowData.availabilityTime : '-',
    },
  ];

  const SEPInstrumentProposalsTableComponent = (
    instrument: InstrumentWithAvailabilityTime
  ) => (
    <SEPInstrumentProposalsTable
      sepId={sepId}
      sepInstrument={instrument}
      selectedCallId={selectedCallId}
    />
  );

  const DoneAllIcon = (): JSX.Element => <DoneAll />;

  return (
    <div data-cy="SEP-meeting-components-table">
      <MaterialTable
        icons={tableIcons}
        title={'Instruments with proposals'}
        columns={columns}
        data={instrumentsData}
        actions={[
          {
            icon: DoneAllIcon,
            onClick: (
              event,
              data:
                | InstrumentWithAvailabilityTime
                | InstrumentWithAvailabilityTime[]
            ) => {
              console.log('Submit', data);
            },
            tooltip: 'Submit instrument',
          },
        ]}
        detailPanel={[
          {
            tooltip: 'Show proposals',
            render: SEPInstrumentProposalsTableComponent,
          },
        ]}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

SEPMeetingComponents.propTypes = {
  sepId: PropTypes.number.isRequired,
};

export default SEPMeetingComponents;
