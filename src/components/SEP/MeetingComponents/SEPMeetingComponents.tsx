import { DoneAll } from '@material-ui/icons';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React from 'react';

import { Instrument } from '../../../generated/sdk';
import { useInstrumentsBySEPData } from '../../../hooks/useInstrumentsBySEPData';
import { tableIcons } from '../../../utils/materialIcons';
import SEPInstrumentProposalsTable from './SEPInstrumentProposalsTable';

type SEPMeetingComponentsProps = {
  sepId: number;
};

const SEPMeetingComponents: React.FC<SEPMeetingComponentsProps> = ({
  sepId,
}) => {
  const { loadingInstruments, instrumentsData } = useInstrumentsBySEPData(
    sepId
  );

  if (loadingInstruments) {
    return <div>Loading...</div>;
  }

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'Instrument scientist',
      render: (rowData: Instrument) =>
        // TODO: This should be reviewed! Maybe we will need some kind of responsible IS for an instrument.
        rowData.scientists && rowData.scientists.length > 0
          ? `${rowData.scientists[0].firstname} ${rowData.scientists[0].lastname}`
          : '-',
    },
  ];

  const SEPInstrumentProposalsTableComponent = (instrument: Instrument) => (
    <SEPInstrumentProposalsTable sepId={sepId} sepInstrument={instrument} />
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
            onClick: (event, data: Instrument | Instrument[]) => {
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
