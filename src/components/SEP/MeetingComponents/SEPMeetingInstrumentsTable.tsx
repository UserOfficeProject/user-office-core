import { DoneAll } from '@material-ui/icons';
import MaterialTable, { Options } from 'material-table';
import PropTypes from 'prop-types';
import React from 'react';

import { InstrumentWithAvailabilityTime } from 'generated/sdk';
import { useInstrumentsBySEPData } from 'hooks/instrument/useInstrumentsBySEPData';
import { tableIcons } from 'utils/materialIcons';

import SEPInstrumentProposalsTable from './SEPInstrumentProposalsTable';

type SEPMeetingInstrumentsTableProps = {
  sepId: number;
  Toolbar: (data: Options) => JSX.Element;
  selectedCallId: number;
};

const SEPMeetingInstrumentsTable: React.FC<SEPMeetingInstrumentsTableProps> = ({
  sepId,
  selectedCallId,
  Toolbar,
}) => {
  const { loadingInstruments, instrumentsData } = useInstrumentsBySEPData(
    sepId,
    selectedCallId
  );

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
        components={{
          Toolbar: Toolbar,
        }}
        data={instrumentsData}
        isLoading={loadingInstruments}
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

SEPMeetingInstrumentsTable.propTypes = {
  sepId: PropTypes.number.isRequired,
  selectedCallId: PropTypes.number.isRequired,
  Toolbar: PropTypes.func.isRequired,
};

export default SEPMeetingInstrumentsTable;
