import MaterialTable from '@material-table/core';
import { Box } from '@mui/material';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BasicUserDetails, UserRole } from 'generated/sdk';
import { Technique } from 'generated/sdk';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { tableIcons } from 'utils/materialIcons';
type AssignedScientistsTableProps = {
  technique: Technique;
  removeScientistFromTechnique: (
    scientistId: number,
    techniqueId: number
  ) => Promise<void>;
};

const assignmentScientistColumns = [
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

const AssignedScientistsTable = ({
  technique,
  removeScientistFromTechnique,
}: AssignedScientistsTableProps) => {
  const { t } = useTranslation();

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

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
      data-cy="technique-scientist-assignments-table"
    >
      <MaterialTable
        icons={tableIcons}
        columns={assignmentScientistColumns}
        title={`Assigned ${i18n.format(t('Scientist'), 'plural')}`}
        data={technique.scientists}
        editable={
          isUserOfficer
            ? {
                onRowDelete: (
                  rowAssignmentsData: BasicUserDetails
                ): Promise<void> =>
                  removeScientistFromTechnique(
                    rowAssignmentsData.id,
                    technique.id
                  ),
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
