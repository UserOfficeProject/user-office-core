import MaterialTable from '@material-table/core';
import Box from '@mui/material/Box';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Instrument, BasicUserDetails, UserRole } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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
const instrumentContactColumns = [
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

  return (
    <Box
      sx={{
        '& tr:last-child td': {
          border: 'none',
        },
        '& .MuiPaper-root': {
          padding: '0 40px',
          backgroundColor: '#fafafa',
        },
      }}
      data-cy="instrument-scientist-assignments-table"
    >
      <MaterialTable
        columns={instrumentContactColumns}
        title={`Instrument Contact`}
        data={[
          {
            firstname: instrument.instrumentContact?.firstname,
            lastname: instrument.instrumentContact?.lastname,
            email: instrument.instrumentContact?.email,
            institution: instrument.instrumentContact?.institution,
          },
        ]}
        options={{
          search: false,
          paging: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
      />
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
    </Box>
  );
};

export default AssignedScientistsTable;
