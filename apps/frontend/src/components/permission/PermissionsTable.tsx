import { Column } from '@material-table/core';
import { Typography } from '@mui/material';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { usePermissionRuleData } from 'hooks/access/useAccessRuleData';
import { FunctionType } from 'utils/utilTypes';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CreateUpdatePermission from './EditPermission';
import { PermissionRule, PermissionRuleFragment, UserRole } from '../../generated/sdk';

const PermissionsTable = () => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingPermissionRules,
    permissionRules,
    setPermissionRulesWithLoading: setPermissions,
  } = usePermissionRuleData();

  const deletePermissionRule = async (id: number | string) => {
    try {
      await api({
        toastSuccessMessage: 'Permission deleted successfully',
      }).deletePermissionRule({
        id: id as number,
      });
      const newObjectsArray = permissionRules.filter(
        (objectItem) => objectItem.id !== id
      );
      setPermissions(newObjectsArray);

      return true;
    } catch (error) {
      return false;
    }
  };

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onCreate: FunctionType<void, [PermissionRule | null]>,
    onUpdate: FunctionType<void, [PermissionRule | null]>,
    editPermission: PermissionRule | null
  ) => (
    <CreateUpdatePermission
      permission={editPermission}
      close={(permission): void => {
        !!permission ? onUpdate(permission) : onCreate(permission);
      }}
    />
  );

  const columns: Column<PermissionRuleFragment>[] = [
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
      <div data-cy="permissions-table">
        <SuperMaterialTable
          createModal={createModal}
          setData={setPermissions}
          delete={deletePermissionRule}
          hasAccess={{
            create: isUserOfficer,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          title={
            <Typography variant="h6" component="h2">
              Permissions
            </Typography>
          }
          columns={columns}
          data={permissionRules}
          isLoading={loadingPermissionRules}
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

export default PermissionsTable;