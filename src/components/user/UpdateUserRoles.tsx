import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import React, { useContext, useEffect, useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { UserContext } from 'context/UserContextProvider';
import { GetUserWithRolesQuery, Role } from 'generated/sdk';
import { useRenewToken } from 'hooks/common/useRenewToken';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import RoleModal from './RoleModal';

export default function UpdateUserRoles(props: { id: number }) {
  const [userData, setUserData] = useState<
    GetUserWithRolesQuery['user'] | null
  >(null);
  const [modalOpen, setOpen] = useState(false);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const [roles, setRoles] = useState<Array<Role>>([]);
  const { setRenewTokenValue } = useRenewToken();
  const { user } = useContext(UserContext);

  const sendUpdateRoles = async (newRoles: Role[]) => {
    const variables = {
      id: props.id,
      roles: newRoles.map((role) => role.id),
    };

    await api('Roles updated successfully!').updateUserRoles(variables);

    if (props.id === user.id) {
      setRenewTokenValue();
    }
  };

  const addRole = async (newSelectedRoles: Role[]) => {
    const newRoles = [...roles, ...newSelectedRoles];
    setRoles(newRoles);
    await sendUpdateRoles(newRoles);
    setOpen(false);
  };

  const removeRole = (role: Pick<Role, 'id' | 'title'>) => {
    const newRoles = [...roles];
    newRoles.splice(
      newRoles.findIndex((element) => role.id === element.id),
      1
    );
    setRoles(newRoles);

    return newRoles;
  };

  useEffect(() => {
    const getUserInformation = () => {
      api()
        .getUserWithRoles({ id: props.id })
        .then((data) => {
          if (data?.user) {
            setUserData({ ...data.user });
            setRoles(data.user.roles);
          }
        });
    };
    getUserInformation();
  }, [props.id, api]);

  const columns = [{ title: 'Name', field: 'title' }];

  return (
    <React.Fragment>
      <RoleModal
        show={modalOpen}
        close={() => setOpen(false)}
        add={addRole}
        activeRoles={roles}
      />
      <MaterialTable
        title="Roles"
        columns={columns}
        icons={tableIcons}
        data={roles.map((role: Role) => {
          return { title: role.title, id: role.id };
        })}
        isLoading={!userData}
        options={{
          search: false,
        }}
        editable={{
          onRowDelete: (oldData) =>
            new Promise<void>(async (resolve) => {
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
          disabled={isExecutingCall}
        >
          Add role
        </Button>
      </ActionButtonContainer>
    </React.Fragment>
  );
}
