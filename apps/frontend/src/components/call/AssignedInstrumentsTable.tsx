import MaterialTable, {
  Column,
  EditComponentProps,
} from '@material-table/core';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { ChangeEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { UserContext } from 'context/UserContextProvider';
import {
  Call,
  InstrumentWithAvailabilityTime,
  UpdateSepToCallInstrumentMutation,
  UserRole,
} from 'generated/sdk';
import { useSEPsData } from 'hooks/SEP/useSEPsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const MAX_32_BIT_INTEGER = Math.pow(2, 31);

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(() => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
      textAlign: 'left',
    },
    '& .MuiPaper-root': {
      padding: '0 40px',
      backgroundColor: '#fafafa',
    },
  },
}));

type AssignedInstrumentsTableProps = {
  call: Call;
  removeAssignedInstrumentFromCall: (
    dataUpdate: InstrumentWithAvailabilityTime[],
    callId: number
  ) => void;
  setInstrumentAvailabilityTime: (
    updatedInstruments: InstrumentWithAvailabilityTime[],
    updatingCallId: number
  ) => void;
  assignInstrumentsToCall: (
    instruments: InstrumentWithAvailabilityTime[]
  ) => void;
};

const AssignedInstrumentsTable = ({
  call,
  removeAssignedInstrumentFromCall,
  setInstrumentAvailabilityTime,
  assignInstrumentsToCall,
}: AssignedInstrumentsTableProps) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const { currentRole } = useContext(UserContext);
  const { SEPs: allActiveSeps, loadingSEPs } = useSEPsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });

  const sepOptions =
    allActiveSeps?.map((sep) => ({
      label: sep.code,
      value: sep.id,
    })) || [];

  const availabilityTimeInput = (
    props: EditComponentProps<InstrumentWithAvailabilityTime> & {
      helperText?: string;
    }
  ) => (
    <TextField
      type="number"
      data-cy="availability-time"
      placeholder={`Availability time (${call.allocationTimeUnit}s)`}
      value={props.value || ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        props.onChange(e.target.value)
      }
      InputProps={{ inputProps: { max: MAX_32_BIT_INTEGER - 1, min: 1 } }}
      required
      fullWidth
      error={props.error}
      helperText={props.helperText}
    />
  );

  const sepSelectionAutoCompleteInput = (
    props: EditComponentProps<InstrumentWithAvailabilityTime> & {
      helperText?: string;
    }
  ) => {
    return (
      <Autocomplete
        loading={loadingSEPs}
        id="sepSelection"
        options={sepOptions}
        renderInput={(params) => (
          <TextField {...params} label="SEPs" margin="none" />
        )}
        onChange={(_event, newValue) => {
          props.onChange(newValue?.value ?? null);
        }}
        style={{ margin: '0' }}
        defaultValue={
          sepOptions.find((item) => item.value === props.rowData.sep?.id)!
        }
      />
    );
  };

  const assignmentColumns: Column<InstrumentWithAvailabilityTime>[] = [
    {
      title: 'Name',
      field: 'name',
      editable: 'never',
    },
    {
      title: 'Short code',
      field: 'shortCode',
      editable: 'never',
    },
    {
      title: 'Description',
      field: 'description',
      editable: 'never',
    },
    {
      title: 'Sep',
      field: 'sepId',
      editable: 'onUpdate',
      emptyValue: '-',
      editComponent: sepSelectionAutoCompleteInput,
      render: (rowData: InstrumentWithAvailabilityTime) => {
        return <span>{rowData.sep?.code}</span>;
      },
    },
    {
      title: `Availability time (${call.allocationTimeUnit}s)`,
      field: 'availabilityTime',
      editable: 'onUpdate',
      type: 'numeric',
      emptyValue: '-',
      editComponent: availabilityTimeInput,
      align: 'left',
      validate: (
        rowData: InstrumentWithAvailabilityTime & {
          tableData?: { editing: string };
        }
      ) => {
        // NOTE: Return valid state if the action is delete and not update
        if (rowData.tableData?.editing !== 'update') {
          return { isValid: true };
        }

        if (rowData.availabilityTime && +rowData.availabilityTime > 0) {
          // NOTE: Preventing inputs grater than 32-bit integer.
          if (+rowData.availabilityTime >= MAX_32_BIT_INTEGER) {
            return {
              isValid: false,
              helperText: `Availability time can not be grater than ${
                MAX_32_BIT_INTEGER - 1
              }`,
            };
          }

          return { isValid: true };
        } else {
          return {
            isValid: false,
            helperText: 'Availability time must be a positive number',
          };
        }
      },
    },
  ];

  const removeAssignedInstrument = async (instrumentId: number) => {
    await api({
      toastSuccessMessage:
        'Assigned ' +
        i18n.format(t('instrument'), 'lowercase') +
        ' removed successfully!',
    }).removeAssignedInstrumentFromCall({
      callId: call.id,
      instrumentId,
    });

    const dataUpdate = call.instruments.filter(
      (instrumentItem) => instrumentItem.id !== instrumentId
    );
    removeAssignedInstrumentFromCall(dataUpdate, call.id);
  };

  const updateInstrument = async (instrumentUpdatedData: {
    id: number;
    availabilityTime: number | string;
  }) => {
    await api({
      toastSuccessMessage: 'Availability time set successfully!',
    }).setInstrumentAvailabilityTime({
      callId: call.id,
      instrumentId: instrumentUpdatedData.id,
      availabilityTime: +instrumentUpdatedData.availabilityTime,
    });

    const newUpdatedData = call.instruments.map((instrument) => ({
      ...instrument,
      availabilityTime:
        instrument.id === instrumentUpdatedData.id
          ? +instrumentUpdatedData.availabilityTime
          : instrument.availabilityTime,
    }));

    setInstrumentAvailabilityTime(newUpdatedData, call.id);
  };

  const updateSepToCallInstrument = async (
    instrumentUpdatedData: InstrumentWithAvailabilityTime
  ) => {
    const response = await api({
      toastSuccessMessage: 'Sep updated successfully!',
    }).updateSepToCallInstrument({
      callId: call.id,
      instrumentId: instrumentUpdatedData.id,
      sepId: instrumentUpdatedData.sepId,
    });

    assignInstrumentsToCall(
      response.updateSepToCallInstrument
        .instruments as InstrumentWithAvailabilityTime[]
    );

    return response;
  };

  return (
    <>
      <div className={classes.root} data-cy="call-instrument-assignments-table">
        <MaterialTable
          icons={tableIcons}
          columns={assignmentColumns}
          title={
            'Assigned ' +
            i18n.format(i18n.format(t('instrument'), 'plural'), 'lowercase')
          }
          data={call.instruments}
          editable={{
            onRowDelete: (
              rowAssignmentsData: InstrumentWithAvailabilityTime
            ): Promise<void> => removeAssignedInstrument(rowAssignmentsData.id),
            onRowUpdate: (instrumentUpdatedData) => {
              const selectedInstrument = call.instruments.find(
                (instrument) => instrument.id === instrumentUpdatedData.id
              );
              const instrumentUpdatePromise = new Promise<void>(
                async (resolve, reject) => {
                  if (
                    instrumentUpdatedData &&
                    instrumentUpdatedData.availabilityTime &&
                    selectedInstrument?.availabilityTime !==
                      instrumentUpdatedData.availabilityTime
                  ) {
                    await updateInstrument({
                      id: instrumentUpdatedData.id,
                      availabilityTime: instrumentUpdatedData.availabilityTime,
                    });
                    resolve();
                  } else {
                    reject();
                  }
                }
              );

              const sepUpdatePromise =
                new Promise<UpdateSepToCallInstrumentMutation>(
                  async (resolve, reject) => {
                    if (
                      instrumentUpdatedData &&
                      selectedInstrument?.sepId !== instrumentUpdatedData.sepId
                    ) {
                      const response = await updateSepToCallInstrument({
                        ...instrumentUpdatedData,
                      });
                      resolve(response);
                    } else {
                      reject();
                    }
                  }
                );

              return Promise.all([
                instrumentUpdatePromise,
                sepUpdatePromise,
              ]).then((values) => {
                console.log(values[1].updateSepToCallInstrument.instruments);
                assignInstrumentsToCall(
                  values[1].updateSepToCallInstrument
                    .instruments as InstrumentWithAvailabilityTime[]
                );
              });
            },
          }}
          options={{
            search: false,
            paging: false,
            headerStyle: { backgroundColor: '#fafafa' },
            headerSelectionProps: {
              inputProps: { 'aria-label': 'Select All Rows' },
            },
            debounceInterval: 400,
          }}
        />
      </div>
    </>
  );
};

AssignedInstrumentsTable.propTypes = {
  call: PropTypes.any.isRequired,
  removeAssignedInstrumentFromCall: PropTypes.func.isRequired,
  setInstrumentAvailabilityTime: PropTypes.func.isRequired,
};

export default AssignedInstrumentsTable;
