import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

import { GetUserWithRolesQuery, Role } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';
import { useRenewToken } from 'hooks/useRenewToken';
import { tableIcons } from 'utils/materialIcons';

import { ActionButtonContainer } from '../common/ActionButtonContainer';
import RoleModal from './RoleModal';

export default function UpdateUserRoles(props: { id: number }) {
  const [userData, setUserData] = useState<
    GetUserWithRolesQuery['user'] | null
  >(null);
  const [modalOpen, setOpen] = useState(false);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [roles, setRoles] = useState<Array<Role>>([]);
  const { setRenewTokenValue } = useRenewToken();

  const sendUpdateRoles = async (newRoles: Role[]) => {
    const variables = {
      id: props.id,
      roles: newRoles.map(role => role.id),
    };

    const userUpdateResult = await api().updateUserRoles(variables);
    setRenewTokenValue();

    enqueueSnackbar('Updated Roles', {
      variant: userUpdateResult.updateUser.error ? 'error' : 'success',
    });
  };

  const addRole = async (role: Role) => {
    const newRoles = [...roles, role];
    setRoles(newRoles);
    await sendUpdateRoles(newRoles);
    setOpen(false);
  };

  const removeRole = (role: Pick<Role, 'id' | 'title'>) => {
    const newRoles = [...roles];
    newRoles.splice(
      newRoles.findIndex(element => role.id === element.id),
      1
    );
    setRoles(newRoles);

    return newRoles;
  };

  useEffect(() => {
    const getUserInformation = () => {
      api()
        .getUserWithRoles({ id: props.id })
        .then(data => {
          if (data?.user) {
            setUserData({ ...data.user });
            setRoles(data.user.roles);
          }
        });
    };
    getUserInformation();
  }, [props.id, api]);

  const columns = [{ title: 'Name', field: 'title' }];

  if (!userData) {
    return <p>Loading</p>;
  }

  return (
    <React.Fragment>
      <RoleModal show={modalOpen} close={() => setOpen(false)} add={addRole} />
      <MaterialTable
        title="Roles"
        columns={columns}
        icons={tableIcons}
        data={roles.map((role: Role) => {
          return { title: role.title, id: role.id };
        })}
        options={{
          search: false,
        }}
        editable={{
          onRowDelete: oldData =>
            new Promise(async resolve => {
              const newRoles = removeRole(oldData);
              await sendUpdateRoles(newRoles);
              resolve();
            }),
        }}
      />

      <ActionButtonContainer>
        <Button
          type="button"
          variant="contained"
          color="primary"
          data-cy="add-role-button"
          onClick={() => setOpen(true)}
        >
          Add role
        </Button>
      </ActionButtonContainer>
    </React.Fragment>
  );
}
