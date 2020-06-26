import Button from '@material-ui/core/Button';
import AddBox from '@material-ui/icons/AddBox';
import { makeStyles } from '@material-ui/styles';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';

import { GetUserWithRolesQuery, Role } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useRenewToken } from '../../hooks/useRenewToken';
import { tableIcons } from '../../utils/materialIcons';
import RoleModal from './RoleModal';

const useStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

export default function UpdateUserRoles(props: { id: number }) {
  const [userData, setUserData] = useState<
    GetUserWithRolesQuery['user'] | null
  >(null);
  const [modalOpen, setOpen] = useState(false);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [roles, setRoles] = useState<Array<Role>>([]);
  const { setRenewTokenValue } = useRenewToken();

  const addRole = async (role: Role) => {
    setRoles([...roles, role]);
    setOpen(false);
  };

  const removeRole = (role: Pick<Role, 'id' | 'title'>) => {
    const newRoles = [...roles];
    newRoles.splice(
      newRoles.findIndex(element => role.id === element.id),
      1
    );
    setRoles(newRoles);
  };

  const sendUserUpdate = async () => {
    const variables = {
      id: props.id,
      roles: roles.map(role => role.id),
    };

    const userUpdateResult = await api().updateUserRoles(variables);
    setRenewTokenValue();

    enqueueSnackbar('Updated Roles', {
      variant: userUpdateResult.updateUser.error ? 'error' : 'success',
    });
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

  const classes = useStyles();

  if (!userData) {
    return <p>Loading</p>;
  }

  const AddBoxIcon = (): JSX.Element => <AddBox />;

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
        actions={[
          {
            icon: AddBoxIcon,
            tooltip: 'Add Role',
            isFreeAction: true,
            onClick: () => setOpen(true),
          },
        ]}
        editable={{
          onRowDelete: oldData =>
            new Promise(resolve => {
              resolve();
              removeRole(oldData);
            }),
        }}
      />

      <div className={classes.buttons}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => sendUserUpdate()}
        >
          Update Roles
        </Button>
      </div>
    </React.Fragment>
  );
}
