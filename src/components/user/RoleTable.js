import { AddBox } from "@material-ui/icons";
import MaterialTable from "material-table";
import React from "react";
import { useDataApi } from "../../hooks/useDataApi";
import { tableIcons } from "../../utils/tableIcons";

function sendRoleRequest(apiCall) {
  return apiCall()
    .getRoles()
    .then(data => {
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
  const sendRequest = useDataApi();
  const columns = [
    { title: "Title", field: "title" },
    { title: "ID", field: "id" }
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Add Role"
      columns={columns}
      data={() => sendRoleRequest(sendRequest)}
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
