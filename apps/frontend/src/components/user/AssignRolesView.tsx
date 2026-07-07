import MaterialTable, { Query, QueryResult } from '@material-table/core';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import Button from '@mui/material/Button/Button';
import React, { useState } from 'react';

import { PaginationSortDirection } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { StrictColumn } from 'utils/utilTypes';

import { MassRoleAssignment } from './MassRoleAssignment';

export type BasicUserDetailsWithRoles = {
  id: number;
  firstname: string;
  lastname: string;
  preferredname: string | null;
  institution: string;
  institutionId: number;
  email: string | null;
  country: string | null;
  oidcSub: string | null;
  roles: {
    title: string;
  }[];
};

const localColumns = [
  { title: 'First Name', field: 'firstname' },
  { title: 'Last Name', field: 'lastname' },
  { title: 'Preferred Name', field: 'preferredname' },
  { title: 'Institution', field: 'institution' },
  { title: 'Email', field: 'email' },
  {
    title: 'Roles',
    field: 'roles',
    width: '30%',
    render: (rowData) => rowData.roles?.map((r) => r.title).join(', ') ?? '',
  },
] satisfies StrictColumn<BasicUserDetailsWithRoles>[];

export default function AssignRolesView() {
  const [selectedUsers, setSelectedUsers] = useState<
    Set<BasicUserDetailsWithRoles>
  >(new Set());

  const tableRef = React.useRef<MaterialTable<BasicUserDetailsWithRoles>>();

  const { api } = useDataApiWithFeedback();

  const [showMassRoleAssignment, setShowMassRoleAssignment] = useState(false);

  const fetchRemoteUsersData = (tableQuery: Query<BasicUserDetailsWithRoles>) =>
    new Promise<QueryResult<BasicUserDetailsWithRoles>>((resolve, reject) => {
      const [orderBy] = tableQuery.orderByCollection;

      try {
        api()
          .getUsersWithRoles({
            first: tableQuery.pageSize,
            offset: tableQuery.page * tableQuery.pageSize,
            sortField: orderBy?.orderByField,
            subtractUsers: Array.from(selectedUsers).map((u) => u.id),
            sortDirection:
              orderBy?.orderDirection == PaginationSortDirection.ASC
                ? PaginationSortDirection.ASC
                : orderBy?.orderDirection == PaginationSortDirection.DESC
                  ? PaginationSortDirection.DESC
                  : undefined,
            searchText: tableQuery.search,
          })
          .then((data) => {
            resolve({
              data: data.usersWithRoles?.users ?? [],
              page: tableQuery.page,
              totalCount: data.usersWithRoles?.totalCount ?? 0,
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });

  const addAction = [
    {
      icon: () => <Add />,
      tooltip: 'Assign Roles',
      onClick: (
        _: React.MouseEvent<HTMLButtonElement>,
        rowData: BasicUserDetailsWithRoles | BasicUserDetailsWithRoles[]
      ) => {
        setSelectedUsers((prev) =>
          new Set(prev).add(rowData as BasicUserDetailsWithRoles)
        );

        tableRef.current?.onQueryChange({});
      },
    },
  ];

  const removeAction = [
    {
      icon: () => <Remove />,
      tooltip: 'Remove User',
      onClick: (
        _: React.MouseEvent<HTMLButtonElement>,
        rowData: BasicUserDetailsWithRoles | BasicUserDetailsWithRoles[]
      ) => {
        setSelectedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.forEach((user) => {
            if (user.id === (rowData as BasicUserDetailsWithRoles).id) {
              newSet.delete(user);
            }
          });

          return newSet;
        });
      },
    },
  ];

  const rolesAssigned = () => {
    setSelectedUsers(new Set());
    tableRef.current?.onQueryChange({});
  };

  return (
    <>
      <MassRoleAssignment
        open={showMassRoleAssignment}
        users={Array.from(selectedUsers)}
        setOpen={setShowMassRoleAssignment}
        rolesAssigned={rolesAssigned}
      />
      <MaterialTable
        title="Pick users to assign roles"
        data={fetchRemoteUsersData}
        columns={localColumns}
        actions={addAction}
        options={{
          search: true,
          paging: true,
          debounceInterval: 700,
          pageSize: 5,
        }}
        tableRef={tableRef}
      />
      <MaterialTable
        title="Selected Users"
        data={Array.from(selectedUsers)}
        columns={localColumns}
        options={{
          search: true,
          paging: true,
        }}
        actions={removeAction}
      />
      <Button
        onClick={() => setShowMassRoleAssignment(true)}
        data-cy="update-roles"
        sx={{
          marginTop: '1rem',
        }}
        disabled={selectedUsers.size === 0}
      >
        Update Roles
      </Button>
    </>
  );
}
