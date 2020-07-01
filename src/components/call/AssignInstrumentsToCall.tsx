import { ResourceId, getTranslation } from '@esss-swap/duo-localisation';
import { Assignment } from '@material-ui/icons';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import {
  Instrument,
  InstrumentWithAvailabilityTime,
} from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useInstrumentsData } from '../../hooks/useInstrumentsData';
import { tableIcons } from '../../utils/materialIcons';

type AssignInstrumentsToCallProps = {
  assignInstrumentsToCall: (
    instruments: InstrumentWithAvailabilityTime[]
  ) => void;
  callId: number;
  assignedInstruments?: InstrumentWithAvailabilityTime[] | null;
};

const AssignInstrumentsToCall: React.FC<AssignInstrumentsToCallProps> = ({
  assignInstrumentsToCall,
  callId,
  assignedInstruments,
}) => {
  const { loading, instrumentsData } = useInstrumentsData();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const columns = [
    { title: 'ID', field: 'instrumentId' },
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
  ];

  if (loading || !instrumentsData) {
    return <div>Loading...</div>;
  }

  const instruments = instrumentsData.filter(instrument => {
    if (
      !assignedInstruments?.find(
        assignedInstrument =>
          assignedInstrument.instrumentId === instrument.instrumentId
      )
    ) {
      return instrument;
    }

    return null;
  }) as Instrument[];

  const onAssignButtonClick = async (
    instrumentsToAssign: InstrumentWithAvailabilityTime[]
  ) => {
    const assignInstrumentToCallResult = await api().assignInstrumentToCall({
      callId,
      instrumentIds: instrumentsToAssign.map(
        instrumentToAssign => instrumentToAssign.instrumentId
      ),
    });

    if (assignInstrumentToCallResult.assignInstrumentToCall.error) {
      enqueueSnackbar(
        getTranslation(
          assignInstrumentToCallResult.assignInstrumentToCall
            .error as ResourceId
        ),
        {
          variant: 'error',
        }
      );
    } else {
      assignInstrumentsToCall(instrumentsToAssign);
    }
  };

  const AssignIcon = (): JSX.Element => <Assignment />;

  return (
    <MaterialTable
      icons={tableIcons}
      title={'Instruments'}
      columns={columns}
      data={instruments}
      actions={[
        {
          icon: AssignIcon,
          tooltip: 'Assign instruments to call',
          onClick: (event, rowData): void => {
            onAssignButtonClick(rowData as InstrumentWithAvailabilityTime[]);
          },
          position: 'toolbarOnSelect',
        },
      ]}
      options={{
        search: true,
        selection: true,
        debounceInterval: 400,
      }}
    />
  );
};

AssignInstrumentsToCall.propTypes = {
  assignInstrumentsToCall: PropTypes.func.isRequired,
  callId: PropTypes.number.isRequired,
  assignedInstruments: PropTypes.array,
};

export default AssignInstrumentsToCall;
