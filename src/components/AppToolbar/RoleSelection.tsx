import MaterialTable from '@material-table/core';
import Button from '@mui/material/Button';
import React, { useContext, useState, useEffect } from 'react';
import { Redirect, useHistory } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import { Role } from 'generated/sdk';
import { getUniqueArrayBy } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

const columns = [
  {
    title: 'Action',
    field: 'roleAction',
  },
  { title: 'Role', field: 'title' },
];

const RoleSelection: React.FC<{ onClose: FunctionType }> = ({ onClose }) => {
  const { currentRole, token, handleNewToken } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const { api } = useDataApiWithFeedback();
  const history = useHistory();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    let unmounted = false;

    const getUserInformation = async () => {
      setLoading(true);
      const data = await api().getMyRoles();
      if (unmounted) {
        return;
      }

      if (data?.me) {
        /** NOTE: We have roles that are duplicated in role_id and user_id but different only in sep_id
         *  which is used to determine if the user with that role is member of a SEP.
         */
        setRoles(getUniqueArrayBy(data.me?.roles, 'id'));
        setLoading(false);
      }
    };
    getUserInformation();

    return () => {
      unmounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!roles) {
    return <Redirect to="/SignIn" />;
  }

  const selectUserRole = async (role: Role) => {
    setLoading(true);
    const result = await api({
      toastSuccessMessage: 'User role changed!',
    }).selectRole({
      token,
      selectedRoleId: role.id,
    });

    if (!result.selectRole.rejection) {
      history.push('/');

      setTimeout(() => {
        handleNewToken(result.selectRole.token);

        onClose();
      }, 500);
    }
  };

  const RoleAction = (rowData: Role) => (
    <>
      {rowData.shortCode.toUpperCase() === currentRole?.valueOf() ? (
        <Button variant="text" disabled>
          In Use
        </Button>
      ) : (
        <Button
          variant="text"
          disabled={loading}
          onClick={() => selectUserRole(rowData)}
        >
          Use
        </Button>
      )}
    </>
  );

  const rolesWithRoleAction = roles.map((role) => ({
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
        isLoading={loading}
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
