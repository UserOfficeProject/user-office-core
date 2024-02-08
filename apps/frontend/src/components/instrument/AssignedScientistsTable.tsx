import MaterialTable from '@material-table/core';
import makeStyles from '@mui/styles/makeStyles';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
    title: 'Institution',
    field: 'institution',
  },
];
const beamLineManagerColumns = [
  {
    title: 'Name',
    field: 'firstname',
  },
  {
    title: 'Surname',
    field: 'lastname',
  },
  {
    title: 'Email',
    field: 'email',
  },
  {
    title: 'Institution',
    field: 'institution',
  },
];
const AssignedScientistsTable = ({
  instrument,
  removeAssignedScientistFromInstrument,
}: AssignedScientistsTableProps) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const removeAssignedScientist = async (scientistId: number) => {
    await api({
      toastSuccessMessage: 'Scientist removed from instrument!',
    }).removeScientistFromInstrument({
      scientistId,
      instrumentId: instrument.id,
    });

    removeAssignedScientistFromInstrument(scientistId, instrument.id);
  };
  useEffect(() => {
    if (instrument.managerUserId) {
      api()
        .getBasicUserDetails({ userId: instrument.managerUserId })
        .then((data) => {
          return (instrument.beamlineManager = Object.create(
            data.basicUserDetails
          ));
        });
    }
  });

  return (
    <div
      className={classes.root}
      data-cy="instrument-scientist-assignments-table"
    >
      <MaterialTable
        columns={beamLineManagerColumns}
        title={`Beamline Manager`}
        data={[
          {
            firstname: instrument.beamlineManager?.firstname,
            lastname: instrument.beamlineManager?.lastname,
            email: instrument.beamlineManager?.email,
            institution: instrument.beamlineManager?.institution,
          },
        ]}
        options={{
          search: false,
          paging: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      ></MaterialTable>
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={`Assigned ${i18n.format(t('Scientist'), 'plural')}`}
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
