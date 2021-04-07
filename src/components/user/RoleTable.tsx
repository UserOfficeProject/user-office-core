import Button from '@material-ui/core/Button';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import { GetRolesQuery, Role } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';

type RoleTableProps = {
  add: (values: Role[]) => void;
  activeRoles: Role[];
};

const RoleTable: React.FC<RoleTableProps> = ({ add, activeRoles }) => {
  const api = useDataApi();
  const columns = [{ title: 'Role', field: 'title' }];
  const [roles, setRoles] = useState<GetRolesQuery['roles']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  useEffect(() => {
    const getRoles = async () => {
      setIsLoading(true);
      const data = await api()
        .getRoles()
        .then((data: GetRolesQuery) => {
          return {
            page: 0,
            totalCount: data?.roles?.length,
            data: data?.roles,
          };
        });

      if (data) {
        setRoles(data.data);
        setIsLoading(false);
      }
    };
    getRoles();
  }, [api]);

  const inactiveRoles = roles?.filter(
    (role) => !activeRoles.find((activeRole) => activeRole.id === role.id)
  );

  return (
    <>
      <MaterialTable
        icons={tableIcons}
        title="Add Roles"
        columns={columns}
        data={inactiveRoles as Role[]}
        isLoading={isLoading}
        onSelectionChange={(data) => setSelectedRoles(data)}
        options={{
          search: true,
          selection: true,
        }}
        localization={{
          toolbar: {
            nRowsSelected: (numberOfSelectedRoles) =>
              `${numberOfSelectedRoles} selected`,
          },
        }}
      />
      <ActionButtonContainer>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => {
            setIsLoading(true);
            add(selectedRoles);
          }}
          disabled={selectedRoles.length === 0 || isLoading}
          data-cy="assign-instrument-to-call"
        >
          Update
        </Button>
      </ActionButtonContainer>
    </>
  );
};

RoleTable.propTypes = {
  add: PropTypes.func.isRequired,
  activeRoles: PropTypes.array.isRequired,
};

export default RoleTable;
