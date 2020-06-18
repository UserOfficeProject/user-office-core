import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { makeStyles } from '@material-ui/core';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import { Instrument, Call } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { tableIcons } from '../../utils/materialIcons';

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
    instrumentId: number,
    callId: number
  ) => void;
};

const AssignedInstrumentsTable: React.FC<AssignedInstrumentsTableProps> = ({
  call,
  removeAssignedInstrumentFromCall,
}) => {
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const assignmentColumns = [
    {
      title: 'ID',
      field: 'instrumentId',
    },
    {
      title: 'Name',
      field: 'name',
    },
    {
      title: 'Short code',
      field: 'name',
    },
    {
      title: 'Description',
      field: 'description',
    },
  ];

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
      removeAssignedInstrumentFromCall(instrumentId, call.id);
    }
  };

  return (
    <div className={classes.root} data-cy="call-instrument-assignments-table">
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned reviewers'}
        data={call.instruments}
        editable={{
          onRowDelete: (rowAssignmentsData: Instrument): Promise<void> =>
            removeAssignedInstrument(rowAssignmentsData.instrumentId),
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
};

export default AssignedInstrumentsTable;
