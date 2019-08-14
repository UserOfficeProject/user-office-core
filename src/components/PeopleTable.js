import React, { useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { useDataAPI } from "../hooks/useDataAPI";

function sendUserRequest(searchQuery, apiCall, setLoading) {
  const query = `
  query($filter: String!, $first: Int!, $offset: Int!) {
    users(filter: $filter, first: $first, offset: $offset){
      users{
      firstname
      lastname
      username
      id
      }
      totalCount
    }
  }`;

  const variables = {
    filter: searchQuery.search,
    offset: searchQuery.pageSize * searchQuery.page,
    first: searchQuery.pageSize
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
          username: user.username,
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
    { title: "Username", field: "username" }
  ];
  return (
    <MaterialTable
      icons={tableIcons}
      title={props.title}
      columns={columns}
      data={
        props.data
          ? props.data
          : query => sendUserRequest(query, sendRequest, setLoading)
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
  );
}

export default PeopleTable;
