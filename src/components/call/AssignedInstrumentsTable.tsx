import MaterialTable, { Column } from '@material-table/core';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { ChangeEvent } from 'react';

import { Call, InstrumentWithAvailabilityTime } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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

const AssignedInstrumentsTable: React.FC<AssignedInstrumentsTableProps> = ({
  call,
  removeAssignedInstrumentFromCall,
  setInstrumentAvailabilityTime,
}) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();

  const availabilityTimeInput = ({
    onChange,
    value,
  }: {
    onChange: (e: string) => void;
    value: string;
  }) => (
    <TextField
      type="number"
      data-cy="availability-time"
      placeholder={`Availability time (${call.allocationTimeUnit}s)`}
      value={value || ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      required
      fullWidth
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
    },
  ];

  const removeAssignedInstrument = async (instrumentId: number) => {
    const result = await api({
      toastSuccessMessage: 'Assigned instrument removed successfully!',
    }).removeAssignedInstrumentFromCall({
      callId: call.id,
      instrumentId,
    });

    if (!result.removeAssignedInstrumentFromCall.rejection) {
      const dataUpdate = call.instruments.filter(
        (instrumentItem) => instrumentItem.id !== instrumentId
      );
      removeAssignedInstrumentFromCall(dataUpdate, call.id);
    }
  };

  const updateInstrument = async (instrumentUpdatedData: {
    id: number;
    availabilityTime: number | string;
  }) => {
    const result = await api({
      toastSuccessMessage: 'Availability time set successfully!',
    }).setInstrumentAvailabilityTime({
      callId: call.id,
      instrumentId: instrumentUpdatedData.id,
      availabilityTime: +instrumentUpdatedData.availabilityTime,
    });

    if (!result.setInstrumentAvailabilityTime.rejection) {
      const newUpdatedData = call.instruments.map((instrument) => ({
        ...instrument,
        availabilityTime:
          instrument.id === instrumentUpdatedData.id
            ? +instrumentUpdatedData.availabilityTime
            : instrument.availabilityTime,
      }));

      setInstrumentAvailabilityTime(newUpdatedData, call.id);
    }
  };

  return (
    <div className={classes.root} data-cy="call-instrument-assignments-table">
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned instruments'}
        data={call.instruments}
        editable={{
          onRowDelete: (
            rowAssignmentsData: InstrumentWithAvailabilityTime
          ): Promise<void> => removeAssignedInstrument(rowAssignmentsData.id),
          onRowUpdate: (instrumentUpdatedData) =>
            new Promise<void>(async (resolve, reject) => {
              if (
                instrumentUpdatedData &&
                instrumentUpdatedData.availabilityTime &&
                +instrumentUpdatedData.availabilityTime > 0
              ) {
                await updateInstrument({
                  id: instrumentUpdatedData.id,
                  availabilityTime: instrumentUpdatedData.availabilityTime,
                });
                resolve();
              } else {
                enqueueSnackbar('Availability time must be positive number', {
                  variant: 'error',
                  className: 'snackbar-error',
                });
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
