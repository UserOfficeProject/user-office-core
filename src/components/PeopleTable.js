import { Email } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import MaterialTable from "material-table";
import React, { useState } from "react";
import { useDataApi } from "../hooks/useDataApi";
import { tableIcons } from "../utils/tableIcons";
import { InviteUserForm } from "./InviteUserForm";

function sendUserRequest(
  searchQuery,
  api,
  setLoading,
  selectedUsers,
  userRole
) {
  const variables = {
    filter: searchQuery.search,
    offset: searchQuery.pageSize * searchQuery.page,
    first: searchQuery.pageSize,
    subtractUsers: selectedUsers ? selectedUsers.map(user => user.id) : []
  };
  if (userRole) {
    variables.userRole = userRole;
  }
  setLoading(true);
  return api()
    .getUsers(variables)
    .then(data => {
      setLoading(false);
      return {
        page: searchQuery.page,
        totalCount: data.users.totalCount,
        data: data.users.users.map(user => {
          return {
            firstname: user.firstname,
            lastname: user.lastname,
            organisation: user.organisation,
            id: user.id
          };
        })
      };
    });
}

function PeopleTable(props) {
  const sendRequest = useDataApi();
  const [loading, setLoading] = useState(false);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const columns = [
    { title: "Name", field: "firstname" },
    { title: "Surname", field: "lastname" },
    { title: "Organisation", field: "organisation" }
  ];

  const classes = makeStyles({
    tableWrapper: {
      "& .MuiToolbar-gutters": {
        paddingLeft: "0"
      }
    }
  })();
  if (sendUserEmail) {
    return <InviteUserForm action={props.action} />;
  }
  let actionArray = [];
  props.action &&
    actionArray.push({
      icon: () => props.actionIcon,
      isFreeAction: props.isFreeAction,
      tooltip: props.title,
      onClick: (event, rowData) => props.action(rowData)
    });
  props.emailInvite &&
    actionArray.push({
      icon: () => <Email />,
      isFreeAction: true,
      tooltip: "Add user by email",
      onClick: () => setSendUserEmail(true)
    });
  return (
    <div data-cy="co-proposers" className={classes.tableWrapper}>
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
                  props.userRole
                )
        }
        isLoading={loading}
        options={{
          search: props.search,
          debounceInterval: 400
        }}
        actions={actionArray}
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
