import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { makeStyles } from '@material-ui/core';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';

import { Instrument, BasicUserDetails } from 'generated/sdk';
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

type AssignedScientistsTableProps = {
  instrument: Instrument;
  removeAssignedScientistFromInstrument: (
    scientistId: number,
    instrumentId: number
  ) => void;
};

const AssignedScientistsTable: React.FC<AssignedScientistsTableProps> = ({
  instrument,
  removeAssignedScientistFromInstrument,
}) => {
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const assignmentColumns = [
    {
      title: 'Name',
      field: 'firstname',
    },
    {
      title: 'Surname',
      field: 'lastname',
    },
    {
      title: 'Organisation',
      field: 'organisation',
    },
  ];

  const removeAssignedScientist = async (scientistId: number) => {
    const result = await api().removeScientistFromInstrument({
      scientistId,
      instrumentId: instrument.instrumentId,
    });

    if (result.removeScientistFromInstrument.error) {
      enqueueSnackbar(
        getTranslation(
          result.removeScientistFromInstrument.error as ResourceId
        ),
        {
          variant: 'error',
        }
      );
    } else {
      removeAssignedScientistFromInstrument(
        scientistId,
        instrument.instrumentId
      );
    }
  };

  return (
    <div
      className={classes.root}
      data-cy="instrument-scientist-assignments-table"
    >
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={'Assigned instruments'}
        data={instrument.scientists}
        editable={{
          onRowDelete: (rowAssignmentsData: BasicUserDetails): Promise<void> =>
            removeAssignedScientist(rowAssignmentsData.id),
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

AssignedScientistsTable.propTypes = {
  instrument: PropTypes.any.isRequired,
  removeAssignedScientistFromInstrument: PropTypes.func.isRequired,
};

export default AssignedScientistsTable;
