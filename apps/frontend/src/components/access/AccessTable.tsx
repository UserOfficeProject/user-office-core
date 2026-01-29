import { Column } from '@material-table/core';
import { Typography } from '@mui/material';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useAccessRuleData } from 'hooks/access/useAccessRuleData';
import { FunctionType } from 'utils/utilTypes';

import EditAccess from './EditAccess';
import { AccessRule, AccessRuleFragment, UserRole } from '../../generated/sdk';

const AccessTable = () => {
  const {
    loadingAccessRules,
    accessRules,
    setAccessRulesWithLoading: setAccess,
  } = useAccessRuleData();

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onCreate: FunctionType<void, [AccessRule | null]>,
    onUpdate: FunctionType<void, [AccessRule | null]>,
    editAccess: AccessRule | null
  ) => (
    <EditAccess
      access={editAccess}
      close={(access: AccessRule | null) => onUpdate(access)}
    />
  );

  const columns: Column<AccessRuleFragment>[] = [
    {
      title: 'Role',
      field: 'role',
    },
    {
      title: 'Subject',
      field: 'subject',
    },
    {
      title: 'Action',
      field: 'action',
    },
    {
      title: 'Conditions',
      field: 'conditions',
    },
  ];

  return (
    <>
      <div data-cy="access-table">
        <SuperMaterialTable
          createModal={createModal}
          setData={setAccess}
          hasAccess={{
            create: isUserOfficer,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          title={
            <Typography variant="h6" component="h2">
              Access
            </Typography>
          }
          columns={columns}
          data={accessRules}
          isLoading={loadingAccessRules}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          persistUrlQueryParams={true}
        />
      </div>
    </>
  );
};

export default AccessTable;