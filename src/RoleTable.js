import React, { useContext } from "react";
import MaterialTable from "material-table";
import { UserContext } from "./UserContextProvider";
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
  const { apiCall } = useContext(UserContext);

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
    { title: "Title", field: "title" },
    { title: "ID", field: "id" }
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Add Role"
      columns={columns}
      data={query => sendRoleRequest(query, apiCall)}
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
