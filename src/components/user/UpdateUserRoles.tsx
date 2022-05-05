import MaterialTable from '@material-table/core';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useContext, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { UserContext } from 'context/UserContextProvider';
import { Role } from 'generated/sdk';
import { useRenewToken } from 'hooks/common/useRenewToken';
import { useUserWithRolesData } from 'hooks/user/useUserWithRoles';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import RoleModal from './RoleModal';

const columns = [{ title: 'Name', field: 'title' }];

export default function UpdateUserRoles(props: { id: number }) {
  const { userData, setUserData, loading } = useUserWithRolesData({
    id: props.id,
  });
  const [modalOpen, setOpen] = useState(false);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { setRenewTokenValue } = useRenewToken();
  const { user } = useContext(UserContext);

  const sendUpdateRoles = async (newRoles: Role[]) => {
    const variables = {
      id: props.id,
      roles: newRoles.map((role) => role.id),
    };

    await api({
      toastSuccessMessage:
        'Roles updated successfully! Any logged in users will still have old permissions until they log back in.',
      toastSuccessMessageVariant: 'warning',
    }).updateUserRoles(variables);

    if (props.id === user.id) {
      setRenewTokenValue();
    }
  };

  const addRole = async (newSelectedRoles: Role[]) => {
    if (!userData) {
      return;
    }

    const newRoles = [...userData.roles, ...newSelectedRoles];
    setUserData({ ...userData, roles: newRoles });
    await sendUpdateRoles(newRoles);
    setOpen(false);
  };

  const removeRole = (role: Pick<Role, 'id' | 'title'>) => {
    if (!userData) {
      return;
    }

    const newRoles = [...userData.roles];
    newRoles.splice(
      newRoles.findIndex((element) => role.id === element.id),
      1
    );
    setUserData({ ...userData, roles: newRoles });

    return newRoles;
  };

  return (
    <div data-cy="user-roles-table">
      <RoleModal
        show={modalOpen}
        close={() => setOpen(false)}
        add={addRole}
        activeRoles={userData?.roles}
      />
      <MaterialTable
        title={
          <Typography variant="h6" component="h2" gutterBottom>
            Roles
          </Typography>
        }
        columns={columns}
        icons={tableIcons}
        data={
          userData?.roles.map((role: Role) => {
            return { title: role.title, id: role.id };
          }) || []
        }
        isLoading={loading}
        options={{
          search: false,
        }}
        editable={{
          onRowDelete: (oldData) =>
            new Promise<void>(async (resolve) => {
              const newRoles = removeRole(oldData);
              if (newRoles) {
                await sendUpdateRoles(newRoles);
              }
              resolve();
            }),
        }}
      />

      <ActionButtonContainer>
        <Button
          type="button"
          data-cy="add-role-button"
          onClick={() => setOpen(true)}
          disabled={isExecutingCall || loading}
        >
          Add role
        </Button>
      </ActionButtonContainer>
    </div>
  );
}
