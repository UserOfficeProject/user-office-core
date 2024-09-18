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
  AssignInstrumentsToCallMutation,
  Instrument,
  UserRole,
} from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const FapSelectionComponent = ({
  onChange,
  id,
}: Instrument & {
  onChange: (id: number, newValue: number | null) => void;
}) => {
  const { currentRole } = useContext(UserContext);
  const { faps: allActiveFaps, loadingFaps } = useFapsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });

  const fapOptions =
    allActiveFaps?.map((fap) => ({
      label: fap.code,
      value: fap.id,
    })) || [];

  return (
    <Autocomplete
      loading={loadingFaps}
      id="fapSelection"
      options={fapOptions}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => (
        <TextField {...params} label="Fap" margin="none" />
      )}
      onChange={(_event, newValue) => {
        onChange(id, newValue?.value || null);
      }}
    />
  );
};

type AssignInstrumentsToCallProps = {
  assignInstrumentsToCall: (
    instruments: AssignInstrumentsToCallMutation['assignInstrumentsToCall']['instruments']
  ) => void;
  callId: number;
  assignedInstruments?: Instrument[] | null;
};

const AssignInstrumentsToCall = ({
  assignInstrumentsToCall,
  callId,
  assignedInstruments,
}: AssignInstrumentsToCallProps) => {
  const { loadingInstruments, instruments } = useInstrumentsData();
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>(
    []
  );
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const [instrumentFapMapping, setInstrumentFapMapping] = useState<{
    [instrumentId: number]: number | null;
  }>({});

  const onChange = (id: number, newValue: number | null) => {
    setInstrumentFapMapping((oldState) => ({
      ...oldState,
      [id]: newValue,
    }));
  };

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'FAP',
      field: 'fap',
      render: (rowData: Instrument) => (
        <FapSelectionComponent {...rowData} onChange={onChange} />
      ),
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

    assignInstrumentsToCall(response.assignInstrumentsToCall.instruments);
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
        onSelectionChange={(data) => setSelectedInstruments(data)}
        options={{
          search: true,
          selection: true,
          headerSelectionProps: {
            inputProps: { 'aria-label': 'Select All Rows' },
          },
          debounceInterval: 400,
          selectionProps: (rowData) => ({
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
