import MaterialTable from '@material-table/core';
import Box from '@mui/material/Box/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions/DialogActions';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { GetRolesQuery } from 'generated/sdk';
import { useRolesData } from 'hooks/user/useRolesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { BasicUserDetailsWithRoles } from './AssignRolesView';

export const MassRoleAssignment = ({
  setOpen,
  open,
  users,
  rolesAssigned,
}: {
  open: boolean;
  users: BasicUserDetailsWithRoles[];
  setOpen: (open: boolean) => void;
  rolesAssigned: () => void;
}) => {
  const { loading, rolesData } = useRolesData();

  const [selectedRoles, setSelectedRoles] = React.useState<
    GetRolesQuery['roles']
  >([]);

  const { api } = useDataApiWithFeedback();

  const assignRoles = async () => {
    api({
      toastSuccessMessage: 'Roles assigned successfully!',
    }).updateUsersRoles({
      userIds: users.map((u) => u.id),
      roles: selectedRoles?.map((r) => r.id),
    });
  };

  const removeRoles = async () => {
    api({
      toastSuccessMessage: 'Roles removed successfully!',
    }).removeUsersRoles({
      userIds: users.map((u) => u.id),
      roles: selectedRoles?.map((r) => r.id),
    });
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth="md"
      onClose={() => {
        setOpen(false);
      }}
    >
      <Box sx={{ padding: '20px' }}>
        <MaterialTable
          // hasAccess={{ create: false, update: false, remove: false }}
          title="Mass Role Assignment"
          data={rolesData ?? []}
          isLoading={loading}
          options={{
            search: false,
            paging: false,
            selection: true,
          }}
          columns={[
            { title: 'Role', field: 'title' },
            { title: 'Description', field: 'description' },
          ]}
          onSelectionChange={(rows) => {
            setSelectedRoles(rows);
          }}
        />
        <DialogActions>
          <ActionButtonContainer>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                assignRoles();
                rolesAssigned();
                setOpen(false);
              }}
              data-cy={'assign-roles'}
            >
              Assign Roles
            </Button>
          </ActionButtonContainer>
          <ActionButtonContainer>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                removeRoles();
                rolesAssigned();
                setOpen(false);
              }}
              data-cy={'remove-roles'}
            >
              Remove Roles
            </Button>
          </ActionButtonContainer>
          <ActionButtonContainer>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </ActionButtonContainer>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
