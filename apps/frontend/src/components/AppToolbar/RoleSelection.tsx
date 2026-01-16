import MaterialTable, { Column } from '@material-table/core';
import Button from '@mui/material/Button';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { Role } from 'generated/sdk';
import { useMeData } from 'hooks/user/useMeData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

const columns: Column<Partial<Role>>[] = [
  {
    title: 'Action',
    field: 'roleAction',
  },
  {
    title: 'Role',
    field: 'title',
  },
  {
    title: 'Description',
    field: 'description',
  },
];

const RoleSelection = ({ onClose }: { onClose: FunctionType }) => {
  const { currentRole, token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const { api } = useDataApiWithFeedback();
  const navigate = useNavigate();
  const { meData, loading: meDataLoading } = useMeData();

  if (!meData) {
    return <p> Loading...</p>;
  }

  const selectUserRole = async (role: Role) => {
    setLoading(true);
    const { selectRole: newToken } = await api({
      toastSuccessMessage: 'User role changed!',
    }).selectRole({
      token,
      selectedRoleId: role.id,
    });

    navigate('/ChangeRole', { state: { newToken } });
    onClose();
  };

  const RoleAction = (rowData: Partial<Role>) => (
    <>
      {rowData.shortCode?.toUpperCase() === currentRole?.valueOf() ? (
        <Button
          variant="text"
          disabled
          data-cy={`selected-role-${rowData.shortCode}`}
        >
          In Use
        </Button>
      ) : (
        <Button
          variant="text"
          disabled={loading}
          onClick={() => selectUserRole(rowData as Role)}
          data-cy={`select-role-${rowData.shortCode}`}
        >
          Use
        </Button>
      )}
    </>
  );

  const rolesWithRoleAction = meData.roles.map((role) => ({
    ...role,
    roleAction: RoleAction(role),
  }));

  return (
    <div data-cy="role-selection-table">
      <MaterialTable
        icons={tableIcons}
        title="User roles"
        columns={columns}
        data={rolesWithRoleAction}
        isLoading={loading || meDataLoading}
        options={{
          search: false,
          paging: false,
          minBodyHeight: '350px',
        }}
      />
    </div>
  );
};

export default RoleSelection;
