import MaterialTable from '@material-table/core';
import { Autocomplete, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { UserContext } from 'context/UserContextProvider';
import {
  Instrument,
  InstrumentWithAvailabilityTime,
  UserRole,
} from 'generated/sdk';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import { useSEPsData } from 'hooks/SEP/useSEPsData';
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
  const { SEPs: allActiveSeps, loadingSEPs } = useSEPsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });

  const [selectedInstruments, setSelectedInstruments] = useState<
    InstrumentWithAvailabilityTime[]
  >([]);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const [instrumentSepMapping, setInstrumentSepMapping] = useState<{
    [instrumentId: number]: number | null;
  }>({});

  const sepOptions =
    allActiveSeps?.map((sep) => ({
      label: sep.code,
      value: sep.id,
    })) || [];

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'SEP',
      field: 'sep',
      render: (rowData: Instrument) => {
        return (
          <Autocomplete
            loading={loadingSEPs}
            id="sepSelection"
            options={sepOptions}
            renderInput={(params) => <TextField {...params} label="SEPs" />}
            onChange={(_event, newValue) => {
              if (newValue) {
                setInstrumentSepMapping({
                  ...instrumentSepMapping,
                  [rowData.id]: newValue.value,
                });
              } else {
                // remove from mapping and set to state
                setInstrumentSepMapping({
                  ...instrumentSepMapping,
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
      instrumentSepIds: selectedInstruments.map((instrumentToAssign) => ({
        instrumentId: instrumentToAssign.id,
        sepId: instrumentSepMapping[instrumentToAssign.id],
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
