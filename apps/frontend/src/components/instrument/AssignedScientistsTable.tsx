import MaterialTable from '@material-table/core';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
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
    title: 'Organisation',
    field: 'organisation',
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
        .getUser({ userId: instrument.managerUserId })
        .then((data) => {
          return (instrument.beamlineManager = Object.create(data.user));
        });
    }
  });

  return (
    <div
      className={classes.root}
      data-cy="instrument-scientist-assignments-table"
    >
      <TableContainer>
        <Table className={classes.root}>
          <TableBody>
            <TableRow key="BeamlinemanagerName">
              <TableCell align="center">
                BeamLine Manager of {instrument.name} :{' '}
                {instrument.beamlineManager?.firstname +
                  ' ' +
                  instrument.beamlineManager?.lastname}
                . Below are the instrument scientists assigned to{' '}
                {instrument.name}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <MaterialTable
        icons={tableIcons}
        columns={assignmentColumns}
        title={`Assigned ${i18n.format(t('instrument'), 'plural')}`}
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
