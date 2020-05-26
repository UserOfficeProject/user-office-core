import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { Button } from '@material-ui/core';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { Redirect, useHistory } from 'react-router';

import { UserContext } from '../../context/UserContextProvider';
import { Role } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { tableIcons } from '../../utils/materialIcons';

const RoleSelection: React.FC = () => {
  const { roles, currentRole, token, handleNewToken, handleRole } = useContext(
    UserContext
  );
  const [loading, setLoading] = useState(false);
  const api = useDataApi();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  if (!roles) {
    return <Redirect to="/SignIn" />;
  }

  const selectUserRole = async (role: Role) => {
    setLoading(true);
    const result = await api().selectRole({ token, selectedRoleId: role.id });

    if (!result.selectRole.error) {
      handleNewToken(result.selectRole.token);

      setTimeout(() => {
        handleRole(role.shortCode);
        history.push('/');
        setLoading(false);

        enqueueSnackbar('User role changed!', {
          variant: 'success',
        });
      }, 500);
    } else {
      enqueueSnackbar(getTranslation(result.selectRole.error as ResourceId), {
        variant: 'error',
      });
    }
  };

  const RoleAction = (rowData: Role) => (
    <>
      {rowData.shortCode === currentRole ? (
        <Button disabled>In Use</Button>
      ) : (
        <Button disabled={loading} onClick={() => selectUserRole(rowData)}>
          Use
        </Button>
      )}
    </>
  );

  const columns = [
    { title: 'ID', field: 'id' },
    { title: 'Title', field: 'title' },
    {
      title: 'Action',
      render: RoleAction,
    },
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="User roles"
      columns={columns}
      data={roles}
      options={{
        search: false,
        paging: false,
        minBodyHeight: '350px',
      }}
    />
  );
};

export default RoleSelection;
