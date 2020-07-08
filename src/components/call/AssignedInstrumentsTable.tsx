import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { makeStyles, TextField } from '@material-ui/core';
import MaterialTable, { Column } from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState, ChangeEvent } from 'react';

import { Call, InstrumentWithAvailabilityTime } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';
import { tableIcons } from 'utils/materialIcons';

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
  const api = useDataApi();
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
      title: 'ID',
      field: 'instrumentId',
      editable: 'never',
    },
    {
      title: 'Name',
      field: 'name',
      editable: 'never',
    },
    {
      title: 'Short code',
      field: 'name',
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
    const result = await api().removeAssignedInstrumentFromcall({
      callId: call.id,
      instrumentId,
    });

    if (result.removeAssignedInstrumentFromcall.error) {
      enqueueSnackbar(
        getTranslation(
          result.removeAssignedInstrumentFromcall.error as ResourceId
        ),
        {
          variant: 'error',
        }
      );
    } else {
      const dataUpdate = call.instruments.filter(
        instrumentItem => instrumentItem.instrumentId !== instrumentId
      );
      removeAssignedInstrumentFromCall(dataUpdate, call.id);
    }
  };

  const updateInstrument = async (
    oldData: InstrumentWithAvailabilityTime,
    newData: InstrumentWithAvailabilityTime
  ) => {
    const result = await api().setInstrumentAvailabilityTime({
      callId: call.id,
      instrumentId: newData.instrumentId,
      availabilityTime: +(newData.availabilityTime as number),
    });

    if (result.setInstrumentAvailabilityTime.error) {
      enqueueSnackbar(
        getTranslation(
          result.setInstrumentAvailabilityTime.error as ResourceId
        ),
        {
          variant: 'error',
        }
      );
    } else {
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
          ): Promise<void> =>
            removeAssignedInstrument(rowAssignmentsData.instrumentId),
          onRowUpdate: (newData, oldData) =>
            new Promise(async (resolve, reject) => {
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
                enqueueSnackbar('Time available must be positive number', {
                  variant: 'error',
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
