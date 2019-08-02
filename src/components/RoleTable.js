import React from "react";
import MaterialTable from "material-table";
import { useDataAPI } from "../hooks/useDataAPI";
import { tableIcons } from "../utils/tableIcons";
import { AddBox } from "@material-ui/icons";

function sendRoleRequest(searchQuery, apiCall) {
  const query = `{
        roles{
          id
          shortCode
          title
        }
      }`;

  return apiCall(query).then(data => {
    return {
      page: 0,
      totalCount: data.roles.length,
      data: data.roles.map(role => {
        return { title: role.title, id: role.id };
      })
    };
  });
}

function RoleTable(props) {
  const sendRequest = useDataAPI();
  const columns = [
    { title: "Title", field: "title" },
    { title: "ID", field: "id" }
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Add Role"
      columns={columns}
      data={query => sendRoleRequest(query, sendRequest)}
      options={{
        search: true
      }}
      actions={[
        {
          icon: () => <AddBox />,
          tooltip: "Select role",
          onClick: (event, rowData) =>
            props.add({ id: rowData.id, title: rowData.title })
        }
      ]}
    />
  );
}

export default RoleTable;
