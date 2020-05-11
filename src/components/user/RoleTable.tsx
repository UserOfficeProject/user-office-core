import { AddBox } from '@material-ui/icons';
import MaterialTable from 'material-table';
import React from 'react';

import { GetRolesQuery, Role } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { tableIcons } from '../../utils/materialIcons';

function sendRoleRequest(apiCall: any) {
  return apiCall()
    .getRoles()
    .then((data: GetRolesQuery) => {
      return {
        page: 0,
        totalCount: data?.roles?.length,
        data: data?.roles,
      };
    });
}

type RoleTableProps = {
  add: (values: Role) => void;
};

const RoleTable: React.FC<RoleTableProps> = props => {
  const sendRequest = useDataApi();
  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'ID', field: 'id' },
  ];

  const AddBoxIcon = (): JSX.Element => <AddBox />;

  return (
    <MaterialTable
      icons={tableIcons}
      title="Add Role"
      columns={columns}
      data={() => sendRoleRequest(sendRequest)}
      options={{
        search: true,
      }}
      actions={[
        {
          icon: AddBoxIcon,
          tooltip: 'Select role',
          onClick: (event, rowData) =>
            props.add({
              id: (rowData as Role).id,
              title: (rowData as Role).title,
              shortCode: (rowData as Role).shortCode,
            }),
        },
      ]}
    />
  );
};

export default RoleTable;
