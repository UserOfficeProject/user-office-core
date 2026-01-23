import { Column } from '@material-table/core';
import { Typography } from '@mui/material';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { usePermissionsData } from 'hooks/permission/usePermissionsData';
import { FunctionType } from 'utils/utilTypes';

import EditPermission from './EditPermission';
import { Permission, PermissionFragment, UserRole } from '../../generated/sdk';

const PermissionsTable = () => {
  const {
    loadingPermissions,
    permissions,
    setPermissionsWithLoading: setPermissions,
  } = usePermissionsData();

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onCreate: FunctionType<void, [Permission | null]>,
    onUpdate: FunctionType<void, [Permission | null]>,
    editPermission: Permission | null
  ) => (
    <EditPermission
      permission={editPermission}
      close={(permission: Permission | null) => onUpdate(permission)}
    />
  );

  const columns: Column<PermissionFragment>[] = [
    {
      title: 'Role',
      field: 'role',
    },
    {
      title: 'Object',
      field: 'object',
    },
    {
      title: 'Action',
      field: 'action',
    },
    {
      title: 'Calls',
      field: 'call',
    },
    {
      title: 'Facility',
      field: 'facility',
    },
    {
      title: 'Instruments',
      render: (data) => {
        const ids = Array.isArray(data.instrument_ids)
          ? data.instrument_ids.flatMap((x) => x.split(','))
          : [];

        return ids.join(', ');
      },
    },
    {
      title: 'Instrument Operator',
      field: 'instrument_operator',
    },
    {
      title: 'Custom Filter',
      field: 'custom_filter',
    },
  ];

  return (
    <>
      <div data-cy="permissions-table">
        <SuperMaterialTable
          createModal={createModal}
          setData={setPermissions}
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
          data={permissions}
          isLoading={loadingPermissions}
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
