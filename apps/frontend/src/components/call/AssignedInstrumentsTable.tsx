import { Column, EditComponentProps } from '@material-table/core';
import { Autocomplete } from '@mui/material';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { ChangeEvent, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import MaterialTable from 'components/common/DenseMaterialTable';
import { UserContext } from 'context/UserContextProvider';
import {
  Call,
  InstrumentWithAvailabilityTime,
  UpdateFapToCallInstrumentMutation,
  UserRole,
} from 'generated/sdk';
import { useFapsData } from 'hooks/fap/useFapsData';
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

const FapSelectionEditComponent = (
  props: EditComponentProps<InstrumentWithAvailabilityTime> & {
    helperText?: string;
  }
) => {
  const { currentRole } = useContext(UserContext);
  const { Faps: allActiveFaps, loadingFaps } = useFapsData({
    filter: '',
    active: true,
    role: currentRole as UserRole,
  });

  const fapOptions =
    allActiveFaps?.map((fap) => ({
      label: fap.code,
      value: fap.id,
    })) || [];

  const value = fapOptions.find((item) => item.value === props.value) || null;

  return (
    <Autocomplete
      loading={loadingFaps}
      id="fapSelection"
      options={fapOptions}
      renderInput={(params) => (
        <TextField {...params} placeholder="Fap" margin="none" />
      )}
      onChange={(_event, newValue) => {
        props.onChange(newValue?.value ?? null);
      }}
      value={value}
    />
  );
};

const AvailabilityTimeEditComponent = (
  props: EditComponentProps<InstrumentWithAvailabilityTime> & {
    helperText?: string;
  }
) => (
  <TextField
    type="number"
    data-cy="availability-time"
    placeholder={props.columnDef.title}
    value={props.value || ''}
    onChange={(e: ChangeEvent<HTMLInputElement>) =>
      props.onChange(e.target.value)
    }
    InputProps={{ inputProps: { max: MAX_32_BIT_INTEGER - 1, min: 1 } }}
    required
    fullWidth
    error={props.error}
    helperText={props.helperText}
    margin="none"
  />
);

const AssignedInstrumentsTable = ({
  call,
  removeAssignedInstrumentFromCall,
  setInstrumentAvailabilityTime,
  assignInstrumentsToCall,
}: AssignedInstrumentsTableProps) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();

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
      title: 'Fap',
      field: 'fapId',
      editable: 'onUpdate',
      emptyValue: '-',
      editComponent: FapSelectionEditComponent,
      render: (rowData: InstrumentWithAvailabilityTime) => {
        return <span>{rowData.fap?.code}</span>;
      },
    },
    {
      title: `Availability time (${call.allocationTimeUnit}s)`,
      field: 'availabilityTime',
      editable: 'onUpdate',
      type: 'numeric',
      emptyValue: '-',
      editComponent: AvailabilityTimeEditComponent,
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

  const updateFapToCallInstrument = async (
    instrumentUpdatedData: InstrumentWithAvailabilityTime
  ) => {
    const response = await api({
      toastSuccessMessage: 'Fap updated successfully!',
    }).updateFapToCallInstrument({
      callId: call.id,
      instrumentId: instrumentUpdatedData.id,
      fapId: instrumentUpdatedData.fapId,
    });

    assignInstrumentsToCall(
      response.updateFapToCallInstrument
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

              const fapUpdatePromise =
                new Promise<UpdateFapToCallInstrumentMutation>(
                  async (resolve, reject) => {
                    if (
                      instrumentUpdatedData &&
                      selectedInstrument?.fapId !== instrumentUpdatedData.fapId
                    ) {
                      const response = await updateFapToCallInstrument({
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
                fapUpdatePromise,
              ]).then((values) => {
                assignInstrumentsToCall(
                  values[1].updateFapToCallInstrument
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
