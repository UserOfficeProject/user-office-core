import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import TagIcon from 'components/common/icons/TagIcon';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { Role } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import RoleModal from './RoleModal';

const RoleManagement: React.FC = () => {
  interface RoleRow {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    isRootRole: boolean;
    permissions: string[];
    tags?: { id: number; name: string }[];
  }

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [allTags, setAllTags] = useState<{ id: number; name: string }[]>([]);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const { api } = useDataApiWithFeedback();

  useEffect(() => {
    const fetchRolesAndTags = async () => {
      try {
        const [rolesResponse, tagsResponse] = await Promise.all([
          api().getRoles(),
          api().getTags(),
        ]);
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
        setAllTags(
          (tagsResponse.tags || []).map((tag) => ({
            id: tag.id,
            name: tag.name,
          }))
        );
      } catch (error) {
        console.error('Error fetching roles and tags:', error);
      }
    };

    fetchRolesAndTags();
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
          {rowData.tags && rowData.tags.length > 0 ? (
            rowData.tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                onDelete={async () => {
                  try {
                    await api({
                      toastSuccessMessage: 'Tag removed from role',
                    }).removeTagFromRole({
                      roleId: rowData.id,
                      tagId: tag.id,
                    });
                    // Refresh roles after tag removal
                    const response = await api().getRoles();
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
                    );
                  } catch (error) {
                    console.error('Error removing tag:', error);
                  }
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              {rowData.isRootRole ? 'NA' : 'No tags'}
            </Typography>
          )}
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

  const handleAssignTag = async () => {
    if (!selectedRole || !selectedTagId) return;

    try {
      await api({
        toastSuccessMessage: 'Tag assigned to role successfully',
      }).addTagToRole({
        roleId: selectedRole.id,
        tagId: selectedTagId,
      });

      // Refresh roles after tag assignment
      const response = await api().getRoles();
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
      );

      setTagDialogOpen(false);
      setSelectedRole(null);
      setSelectedTagId(null);
    } catch (error) {
      console.error('Error assigning tag:', error);
    }
  };

  const getAvailableTags = (): { id: number; name: string }[] => {
    if (!selectedRole) return allTags;
    const assignedTagIds = (selectedRole.tags || []).map((tag) => tag.id);

    return allTags.filter((tag) => !assignedTagIds.includes(tag.id));
  };

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

      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Tag to Role</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedRole && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Role: <strong>{selectedRole.title}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Select a tag to assign:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {getAvailableTags().length > 0 ? (
                  getAvailableTags().map((tag) => (
                    <Box
                      key={tag.id}
                      sx={{
                        p: 1.5,
                        border:
                          selectedTagId === tag.id ? '2px solid' : '1px solid',
                        borderColor:
                          selectedTagId === tag.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor:
                          selectedTagId === tag.id
                            ? 'action.selected'
                            : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                      onClick={() => setSelectedTagId(tag.id)}
                    >
                      <Typography variant="body2">{tag.name}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    All available tags are already assigned to this role.
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignTag}
            variant="contained"
            disabled={!selectedTagId || getAvailableTags().length === 0}
            data-cy="assign-selected-tags"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default RoleManagement;
