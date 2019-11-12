import React, { useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { useDataAPI } from "../hooks/useDataAPI";

function sendUserRequest(
  searchQuery,
  apiCall,
  setLoading,
  selectedUsers,
  usersOnly
) {
  const query = `
  query($filter: String!, $first: Int!, $offset: Int!, $usersOnly: Boolean!, $subtractUsers: [Int!]) {
    users(filter: $filter, first: $first, offset: $offset, usersOnly: $usersOnly, subtractUsers: $subtractUsers){
      users{
      firstname
      lastname
      organisation
      id
      }
      totalCount
    }
  }`;

  const variables = {
    filter: searchQuery.search,
    offset: searchQuery.pageSize * searchQuery.page,
    first: searchQuery.pageSize,
    usersOnly,
    subtractUsers: selectedUsers ? selectedUsers.map(user => user.id) : []
  };
  setLoading(true);
  return apiCall(query, variables).then(data => {
    setLoading(false);
    return {
      page: searchQuery.page,
      totalCount: data.users.totalCount,
      data: data.users.users.map(user => {
        return {
          name: user.firstname,
          surname: user.lastname,
          organisation: user.organisation,
          id: user.id
        };
      })
    };
  });
}

function PeopleTable(props) {
  const sendRequest = useDataAPI();
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: "Name", field: "name" },
    { title: "Surname", field: "surname" },
    { title: "Organisation", field: "organisation" }
  ];
  return (
    <div data-cy='co-proposers'>
      <MaterialTable
        icons={tableIcons}
        title={props.title}
        columns={columns}

        data={
          props.data
            ? props.data
            : query =>
              sendUserRequest(
                query,
                sendRequest,
                setLoading,
                props.selectedUsers,
                props.usersOnly
              )
        }
        isLoading={loading}
        options={{
          search: props.search,
          debounceInterval: 400
        }}
        actions={
          props.action
            ? [
              {
                icon: () => props.actionIcon,
                isFreeAction: props.isFreeAction,
                tooltip: props.title,
                onClick: (event, rowData) => props.action(rowData)
              }
            ]
            : null
        }
        editable={
          props.onRemove
            ? {
              onRowDelete: oldData =>
                new Promise(resolve => {
                  resolve();
                  props.onRemove(oldData);
                })
            }
            : null
        }
      />
    </div>
  );
}

export default PeopleTable;
