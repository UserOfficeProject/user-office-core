import { AddBox } from '@material-ui/icons';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { GetRolesQuery, Role } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { tableIcons } from '../../utils/materialIcons';

type RoleTableProps = {
  add: (values: Role) => void;
};

const RoleTable: React.FC<RoleTableProps> = ({ add }) => {
  const api = useDataApi();
  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'ID', field: 'id' },
  ];
  const [roles, setRoles] = useState<GetRolesQuery['roles']>([]);

  useEffect(() => {
    const getRoles = async () => {
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
      }
    };
    getRoles();
  }, [api]);

  const AddBoxIcon = (): JSX.Element => <AddBox />;

  return (
    <MaterialTable
      icons={tableIcons}
      title="Add Role"
      columns={columns}
      data={roles as Role[]}
      options={{
        search: true,
      }}
      actions={[
        {
          icon: AddBoxIcon,
          tooltip: 'Select role',
          onClick: (event, rowData) =>
            add({
              id: (rowData as Role).id,
              title: (rowData as Role).title,
              shortCode: (rowData as Role).shortCode,
            }),
        },
      ]}
    />
  );
};

RoleTable.propTypes = {
  add: PropTypes.func.isRequired,
};

export default RoleTable;
