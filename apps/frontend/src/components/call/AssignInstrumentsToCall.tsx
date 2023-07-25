import MaterialTable from '@material-table/core';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

const AssignInstrumentsToCall = ({
  assignInstrumentsToCall,
  callId,
  assignedInstruments,
}: AssignInstrumentsToCallProps) => {
  const { loadingInstruments, instruments } = useInstrumentsData();
  const [selectedInstruments, setSelectedInstruments] = useState<
    InstrumentWithAvailabilityTime[]
  >([]);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

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
    await api({
      toastSuccessMessage: t('instrument') + '/s assigned successfully!',
    }).assignInstrumentsToCall({
      callId,
      instrumentIds: selectedInstruments.map(
        (instrumentToAssign) => instrumentToAssign.id
      ),
    });

    assignInstrumentsToCall(selectedInstruments);
  };

  return (
    <>
      <MaterialTable
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h1">
            {i18n.format(t('instrument'), 'plural')}
          </Typography>
        }
        columns={columns}
        data={notAssignedInstruments}
        isLoading={loadingInstruments}
        onSelectionChange={(data) =>
          setSelectedInstruments(data as InstrumentWithAvailabilityTime[])
        }
        options={{
          search: true,
          selection: true,
          headerSelectionProps: {
            inputProps: { 'aria-label': 'Select All Rows' },
          },
          debounceInterval: 400,
          selectionProps: (rowData: InstrumentWithAvailabilityTime) => ({
            inputProps: {
              'aria-label': `${rowData.name}-${rowData.shortCode}-select`,
            },
          }),
        }}
      />
      <ActionButtonContainer>
        <Button
          type="button"
          onClick={() => onAssignButtonClick()}
          disabled={selectedInstruments.length === 0 || isExecutingCall}
          data-cy="assign-instrument-to-call"
        >
          {'Assign ' +
            (selectedInstruments.length > 1
              ? i18n.format(t('instrument'), 'plural')
              : t('instrument'))}
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
