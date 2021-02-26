import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { Instrument, InstrumentWithAvailabilityTime } from 'generated/sdk';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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
  const { loadingInstruments, instruments } = useInstrumentsData();
  const [selectedInstruments, setSelectedInstruments] = useState<
    InstrumentWithAvailabilityTime[]
  >([]);
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
  ];

  const notAssignedInstruments = instruments.filter((instrument) => {
    if (
      !assignedInstruments?.find(
        (assignedInstrument) => assignedInstrument.id === instrument.id
      )
    ) {
      return instrument;
    }

    return null;
  }) as Instrument[];

  const onAssignButtonClick = async () => {
    const assignInstrumentToCallResult = await api(
      'Instrument/s assigned successfully!'
    ).assignInstrumentsToCall({
      callId,
      instrumentIds: selectedInstruments.map(
        (instrumentToAssign) => instrumentToAssign.id
      ),
    });

    if (!assignInstrumentToCallResult.assignInstrumentsToCall.error) {
      assignInstrumentsToCall(selectedInstruments);
    }
  };

  return (
    <>
      <MaterialTable
        icons={tableIcons}
        title={'Instruments'}
        columns={columns}
        data={notAssignedInstruments}
        isLoading={loadingInstruments}
        onSelectionChange={(data) =>
          setSelectedInstruments(data as InstrumentWithAvailabilityTime[])
        }
        options={{
          search: true,
          selection: true,
          debounceInterval: 400,
        }}
      />
      <ActionButtonContainer>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => onAssignButtonClick()}
          disabled={selectedInstruments.length === 0 || isExecutingCall}
          data-cy="assign-instrument-to-call"
        >
          Assign instrument{selectedInstruments.length > 1 && 's'}
        </Button>
      </ActionButtonContainer>
    </>
  );
};

AssignInstrumentsToCall.propTypes = {
  assignInstrumentsToCall: PropTypes.func.isRequired,
  callId: PropTypes.number.isRequired,
  assignedInstruments: PropTypes.array,
};

export default AssignInstrumentsToCall;
