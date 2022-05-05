import MaterialTable from '@material-table/core';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import { Instrument, BasicUserDetails, UserRole } from 'generated/sdk';
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

type AssignedScientistsTableProps = {
  instrument: Instrument;
  removeAssignedScientistFromInstrument: (
    scientistId: number,
    instrumentId: number
  ) => void;
};

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

const AssignedScientistsTable: React.FC<AssignedScientistsTableProps> = ({
  instrument,
  removeAssignedScientistFromInstrument,
}) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const removeAssignedScientist = async (scientistId: number) => {
    const result = await api({
      toastSuccessMessage: 'Scientist removed from instrument!',
    }).removeScientistFromInstrument({
      scientistId,
      instrumentId: instrument.id,
    });

    if (!result.removeScientistFromInstrument.rejection) {
      removeAssignedScientistFromInstrument(scientistId, instrument.id);
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
        editable={
          isUserOfficer
            ? {
                onRowDelete: (
                  rowAssignmentsData: BasicUserDetails
                ): Promise<void> =>
                  removeAssignedScientist(rowAssignmentsData.id),
              }
            : {}
        }
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
