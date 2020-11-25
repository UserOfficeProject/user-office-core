import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useContext, useState, useEffect } from 'react';
import { Redirect, useHistory } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import { Role } from 'generated/sdk';
import { getUniqueArrayBy } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type RoleSelectionProps = {
  close: () => void;
};

const RoleSelection: React.FC<RoleSelectionProps> = ({ close }) => {
  const { currentRole, user, token, handleNewToken } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const { api } = useDataApiWithFeedback();
  const history = useHistory();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const getUserInformation = async () => {
      setLoading(true);
      const data = await api().getMyRoles();

      if (data?.me) {
        /** NOTE: We have roles that are duplicated in role_id and user_id but different only in sep_id
         *  which is used to determine if the user with that role is member of a SEP.
         */
        setRoles(getUniqueArrayBy(data.me?.roles, 'id'));
        setLoading(false);
      }
    };
    getUserInformation();
  }, [user.id, api]);

  if (!roles) {
    return <Redirect to="/SignIn" />;
  }

  const selectUserRole = async (role: Role) => {
    setLoading(true);
    const result = await api('User role changed!').selectRole({
      token,
      selectedRoleId: role.id,
    });

    if (!result.selectRole.error) {
      history.push('/');

      setTimeout(() => {
        handleNewToken(result.selectRole.token);

        close();
      }, 500);
    }
  };

  const RoleAction = (rowData: Role) => (
    <>
      {rowData.shortCode.toUpperCase() === currentRole?.valueOf() ? (
        <Button disabled>In Use</Button>
      ) : (
        <Button disabled={loading} onClick={() => selectUserRole(rowData)}>
          Use
        </Button>
      )}
    </>
  );

  const columns = [
    { title: 'Role', field: 'title' },
    {
      title: 'Action',
      render: RoleAction,
    },
  ];

  return (
    <div data-cy="role-selection-table">
      <MaterialTable
        icons={tableIcons}
        title="User roles"
        columns={columns}
        data={roles}
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

RoleSelection.propTypes = {
  close: PropTypes.func.isRequired,
};

export default RoleSelection;
