import { ResourceId, getTranslation } from '@esss-swap/duo-localisation';
import { Button } from '@material-ui/core';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { Instrument, InstrumentWithAvailabilityTime } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { tableIcons } from 'utils/materialIcons';

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
  const { loadingInstruments, instrumentsData } = useInstrumentsData();
  const [selectedInstruments, setSelectedInstruments] = useState<
    InstrumentWithAvailabilityTime[]
  >([]);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
  ];

  const instruments = instrumentsData.filter(instrument => {
    if (
      !assignedInstruments?.find(
        assignedInstrument => assignedInstrument.id === instrument.id
      )
    ) {
      return instrument;
    }

    return null;
  }) as Instrument[];

  const onAssignButtonClick = async () => {
    const assignInstrumentToCallResult = await api().assignInstrumentToCall({
      callId,
      instrumentIds: selectedInstruments.map(
        instrumentToAssign => instrumentToAssign.id
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
      assignInstrumentsToCall(selectedInstruments);
    }
  };

  return (
    <>
      <MaterialTable
        icons={tableIcons}
        title={'Instruments'}
        columns={columns}
        data={instruments}
        isLoading={loadingInstruments}
        onSelectionChange={data =>
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
          disabled={selectedInstruments.length === 0}
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
