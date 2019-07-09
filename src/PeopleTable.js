import React, { useContext, useState } from "react";
import MaterialTable from "material-table";
import {
  AddBox,
  Check,
  Clear,
  DeleteOutline,
  Edit,
  FilterList,
  ViewColumn,
  ArrowUpward,
  Search,
  FirstPage,
  LastPage,
  ChevronRight,
  ChevronLeft,
  Remove,
  SaveAlt
} from "@material-ui/icons";
import { AppContext } from "./App";

// TODO fix filtering in API
function sendUserRequest(searchQuery, apiCall, setLoading) {
  const query = `
  query($filter: String) {
    users(filter: $filter){
      firstname
      lastname
      username
      id
    }
  }`;

  const variables = {
    filter: searchQuery.search
  };
  setLoading(true);
  return apiCall(query, variables).then(data => {
    setLoading(false);
    return {
      page: 0,
      totalCount: data.users.length,
      data: data.users.map(user => {
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
  const { apiCall } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const tableIcons = {
    Add: AddBox,
    Check: Check,
    Clear: Clear,
    Delete: DeleteOutline,
    DetailPanel: ChevronRight,
    Edit: Edit,
    Export: SaveAlt,
    Filter: FilterList,
    FirstPage: FirstPage,
    LastPage: LastPage,
    NextPage: ChevronRight,
    PreviousPage: ChevronLeft,
    ResetSearch: Clear,
    Search: Search,
    SortArrow: ArrowUpward,
    ThirdStateCheck: Remove,
    ViewColumn: ViewColumn
  };

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
          : query => sendUserRequest(query, apiCall, setLoading)
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
