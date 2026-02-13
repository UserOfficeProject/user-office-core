import { Box, Chip, DialogContent, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';

import TagIcon from 'components/common/icons/TagIcon';
import StyledDialog from 'components/common/StyledDialog';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { Role, Tag } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import AssignTagsForm from './AssignTagsForm';
import RoleModal from './RoleModal';

export type RoleRow = Pick<
  Role,
  'id' | 'shortCode' | 'title' | 'description' | 'isRootRole' | 'permissions'
> & {
  tags?: Pick<Tag, 'id' | 'name'>[];
};

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);

  const { api } = useDataApiWithFeedback();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesResponse = await api().getRoles();
        setRoles(
          (rolesResponse.roles || []).map((role) => ({
            id: role.id,
            shortCode: role.shortCode,
            title: role.title,
            description: role.description,
            isRootRole: role.isRootRole,
            permissions: [],
            tags: role.tags || [],
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
            id: role.id,
            shortCode: role.shortCode,
            title: role.title,
            description: role.description,
            isRootRole: role.isRootRole,
            permissions: [],
            tags: role.tags || [],
          }))
        )
      );
  };

  const columns: Array<{
    title: string;
    field: keyof RoleRow;
    render?: (rowData: RoleRow) => React.ReactNode;
  }> = [
    { title: 'Short Code', field: 'shortCode' },
    { title: 'Title', field: 'title' },
    { title: 'Description', field: 'description' },
    {
      title: 'Tags',
      field: 'tags',
      render: (rowData) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {rowData.tags?.map((tag) => (
            <Chip key={tag.id} label={tag.name} size="small" />
          ))}
        </Box>
      ),
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
    onUpdate: (
      object: RoleRow | null,
      shouldCloseAfterUpdate?: boolean
    ) => void,
    onCreate: (
      object: RoleRow | null,
      shouldCloseAfterCreation?: boolean
    ) => void,
    editRole: RoleRow | null
  ) => (
    <RoleModal
      open={!!editRole || true} // Ensure modal opens for both create and update
      onClose={() => (editRole ? onUpdate(null) : onCreate(null))}
      role={
        editRole
          ? ({
              id: editRole.id,
              shortCode: editRole.shortCode,
              title: editRole.title,
              description: editRole.description,
              isRootRole: false,
              tags: editRole.tags || [],
            } as Role)
          : null
      } // Pass `null` for create mode, or the role object for update mode (ensure tags is an array)
      onSubmit={() => {
        handleRoleSubmit();
        editRole ? onUpdate(null) : onCreate(null);
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
          editable={{
            isDeleteHidden: (rowData: RoleRow) => rowData.isRootRole,
            isEditHidden: (rowData: RoleRow) => rowData.isRootRole,
          }}
          columns={columns}
          data={roles}
          isLoading={false}
          options={{
            search: true,
            paging: true,
          }}
          actions={[
            (rowData: RoleRow) => ({
              icon: () => <TagIcon />,
              tooltip: 'Assign Tags',
              onClick: (event, rowData) => {
                setSelectedRole(rowData as RoleRow);
                setTagDialogOpen(true);
              },
              position: 'row',
              hidden: rowData.isRootRole,
            }),
          ]}
        />
      </StyledPaper>

      <StyledDialog
        open={selectedRole !== null && tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        title={`Assign Tags to ${selectedRole?.title}`}
      >
        <DialogContent sx={{ pt: 0 }}>
          {selectedRole && (
            <AssignTagsForm
              role={selectedRole}
              close={() => setTagDialogOpen(false)}
              onAssign={handleRoleSubmit}
            />
          )}
        </DialogContent>
      </StyledDialog>
    </StyledContainer>
  );
};

export default RoleManagement;
