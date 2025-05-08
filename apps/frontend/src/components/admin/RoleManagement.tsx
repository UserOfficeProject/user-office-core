import { Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { Role } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import RoleModal from './RoleModal';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<
    {
      id: number;
      shortCode: string;
      title: string;
      description: string;
      dataAccess: string[];
      permissions: string[];
    }[]
  >([]);

  const { api } = useDataApiWithFeedback();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api().getRoles();
        setRoles(
          (response.roles || []).map((role) => ({
            ...role,
            dataAccess: role.dataAccess || undefined,
            permissions: role.permissions || undefined,
          }))
        );
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, [api]);

  const handleRoleSubmit = async () => {
    // Refresh roles after create/update
    api()
      .getRoles()
      .then((response) =>
        setRoles(
          (response.roles || []).map((role) => ({
            ...role,
            dataAccess: role.dataAccess || undefined,
            permissions: role.permissions || undefined,
          }))
        )
      );
  };

  interface RoleRow {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    dataAccess: string[];
    permissions: string[];
  }

  const columns: Array<{
    title: string;
    field: keyof RoleRow;
    render?: (rowData: RoleRow) => React.ReactNode;
  }> = [
    { title: 'Short Code', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Description', field: 'description' },
    {
      title: 'Data Access',
      field: 'dataAccess',
      render: (rowData) => rowData.dataAccess?.join(', ') || '-',
    },
    {
      title: 'Permissions',
      field: 'permissions',
      render: (rowData) => rowData.permissions?.join(', ') || '-',
    },
  ];
  const deleteRole = async (id: number | string) => {
    try {
      await api({
        toastSuccessMessage: 'Call deleted successfully',
      }).deleteRole({
        id: id as number,
      });
      const newObjectsArray = roles.filter(
        (objectItem) => objectItem.id !== id
      );
      setRoles(newObjectsArray);

      return true;
    } catch (error) {
      return false;
    }
  };

  const createModal = (
    onUpdate: FunctionType<void, [Role | null]>,
    onCreate: FunctionType<void, [Role | null]>,
    editRole: Role | null
  ) => (
    <RoleModal
      open={!!editRole || true} // Ensure modal opens for both create and update
      onClose={() => (!!editRole ? onUpdate(null) : onCreate(null))}
      role={editRole} // Pass `null` for create mode, or the role object for update mode
      onSubmit={() => {
        handleRoleSubmit();
        !!editRole ? onUpdate(null) : onCreate(null);
      }}
    />
  );

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <Typography variant="h4">Role Management</Typography>
        <SuperMaterialTable
          createModal={createModal}
          setData={setRoles}
          delete={deleteRole}
          hasAccess={{
            create: true,
            update: true,
            remove: true,
          }}
          title={
            <Typography variant="h6" component="h2">
              Existing Roles
            </Typography>
          }
          columns={columns}
          data={roles}
          isLoading={false}
          options={{
            search: true,
            paging: true,
          }}
        />
      </StyledPaper>
    </StyledContainer>
  );
};

export default RoleManagement;
