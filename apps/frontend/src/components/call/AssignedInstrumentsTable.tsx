import MaterialTable, {
  Column,
  EditComponentProps,
} from '@material-table/core';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Call, InstrumentWithAvailabilityTime } from 'generated/sdk';
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
};

const AssignedInstrumentsTable = ({
  call,
  removeAssignedInstrumentFromCall,
  setInstrumentAvailabilityTime,
}: AssignedInstrumentsTableProps) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();

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

  return (
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
          onRowUpdate: (instrumentUpdatedData) =>
            new Promise<void>(async (resolve, reject) => {
              if (
                instrumentUpdatedData &&
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
            }),
        }}
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      />
    </div>
  );
};

AssignedInstrumentsTable.propTypes = {
  call: PropTypes.any.isRequired,
  removeAssignedInstrumentFromCall: PropTypes.func.isRequired,
  setInstrumentAvailabilityTime: PropTypes.func.isRequired,
};

export default AssignedInstrumentsTable;
