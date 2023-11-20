import { Autocomplete, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import MaterialTable from 'components/common/DenseMaterialTable';
import { UserContext } from 'context/UserContextProvider';
import {
  Instrument,
  InstrumentWithAvailabilityTime,
  UserRole,
} from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';
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
  const { currentRole } = useContext(UserContext);
  const { Faps: allActiveFaps, loadingFaps } = useFapsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });

  const [selectedInstruments, setSelectedInstruments] = useState<
    InstrumentWithAvailabilityTime[]
  >([]);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const [instrumentFapMapping, setInstrumentFapMapping] = useState<{
    [instrumentId: number]: number | null;
  }>({});

  const fapOptions =
    allActiveFaps?.map((fap) => ({
      label: fap.code,
      value: fap.id,
    })) || [];

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'Fap',
      field: 'fap',
      render: (rowData: Instrument) => {
        return (
          <Autocomplete
            loading={loadingFaps}
            id="fapSelection"
            options={fapOptions}
            renderInput={(params) => <TextField {...params} label="Faps" />}
            onChange={(_event, newValue) => {
              if (newValue) {
                setInstrumentFapMapping({
                  ...instrumentFapMapping,
                  [rowData.id]: newValue.value,
                });
              } else {
                // remove from mapping and set to state
                setInstrumentFapMapping({
                  ...instrumentFapMapping,
                  [rowData.id]: null,
                });
              }
            }}
          />
        );
      },
    },
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
    const response = await api({
      toastSuccessMessage: t('instrument') + '/s assigned successfully!',
    }).assignInstrumentsToCall({
      callId,
      instrumentFapIds: selectedInstruments.map((instrumentToAssign) => ({
        instrumentId: instrumentToAssign.id,
        fapId: instrumentFapMapping[instrumentToAssign.id],
      })),
    });

    assignInstrumentsToCall(
      response.assignInstrumentsToCall
        .instruments as InstrumentWithAvailabilityTime[]
    );
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
