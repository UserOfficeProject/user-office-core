import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import MaterialTable, { Column } from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { ChangeEvent, useState } from 'react';

import { Call, InstrumentWithAvailabilityTime } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

// NOTE: Some custom styles for row expand table.
const useStyles = makeStyles(() => ({
  root: {
    '& tr:last-child td': {
      border: 'none',
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
      value={value || ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      required
    />
  );

  const [assignmentColumns] = useState<
    Column<InstrumentWithAvailabilityTime>[]
  >([
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
      title: 'Time available',
      field: 'availabilityTime',
      editable: 'onUpdate',
      type: 'numeric',
      emptyValue: '-',
      editComponent: availabilityTimeInput,
    },
  ]);

  const removeAssignedInstrument = async (instrumentId: number) => {
    const result = await api(
      'Assigned instrument removed successfully!'
    ).removeAssignedInstrumentFromCall({
      callId: call.id,
      instrumentId,
    });

    if (!result.removeAssignedInstrumentFromCall.error) {
      const dataUpdate = call.instruments.filter(
        (instrumentItem) => instrumentItem.id !== instrumentId
      );
      removeAssignedInstrumentFromCall(dataUpdate, call.id);
    }
  };

  const updateInstrument = async (
    oldData: InstrumentWithAvailabilityTime,
    newData: InstrumentWithAvailabilityTime
  ) => {
    const result = await api(
      'Availability time set successfully!'
    ).setInstrumentAvailabilityTime({
      callId: call.id,
      instrumentId: newData.id,
      availabilityTime: +(newData.availabilityTime as number),
    });

    if (!result.setInstrumentAvailabilityTime.error) {
      const dataUpdate = [...call.instruments];
      const index = dataUpdate.indexOf(oldData);
      dataUpdate[index] = newData;

      setInstrumentAvailabilityTime(dataUpdate, call.id);
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
          onRowUpdate: (newData, oldData) =>
            new Promise<void>(async (resolve, reject) => {
              if (
                newData &&
                newData.availabilityTime &&
                +newData.availabilityTime > 0
              ) {
                await updateInstrument(
                  oldData as InstrumentWithAvailabilityTime,
                  newData
                );
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
