import React, { useState } from "react";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { useDataAPI } from "../hooks/useDataAPI";
import { makeStyles } from "@material-ui/styles";
import { Email } from "@material-ui/icons";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-material-ui";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useCreateUserInvite } from "../hooks/useCreateUserInvite";

function sendUserRequest(
  searchQuery,
  apiCall,
  setLoading,
  selectedUsers,
  usersOnly
) {
  const query = `
  query($filter: String!, $first: Int!, $offset: Int!, $usersOnly: Boolean, $subtractUsers: [Int!]) {
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
  const sendRequest = useDataAPI();
  const [loading, setLoading] = useState(false);
  const [sendUserEmail, setSendUserEmail] = useState(false);
  const { createUserInvite } = useCreateUserInvite();

  const columns = [
    { title: "Name", field: "firstname" },
    { title: "Surname", field: "lastname" },
    { title: "Organisation", field: "organisation" }
  ];

  const classes = makeStyles({
    tableWrapper: {
      "& .MuiToolbar-gutters": {
        paddingLeft: "0"
      },
      buttons: {
        display: "flex",
        justifyContent: "flex-end"
      },
      button: {
        marginTop: "25px",
        marginLeft: "10px"
      }
    }
  })();
  if (sendUserEmail) {
    return (
      <Formik
        onSubmit={async (values, actions) => {
          const id = await createUserInvite(
            values.name,
            values.lastname,
            values.email
          );
          props.action({
            firstname: values.name,
            lastname: values.lastname,
            organisation: "",
            id
          });
        }}
      >
        {subformik => (
          <Form>
            <Typography component="h1" variant="h5">
              Invite by Email
            </Typography>
            <Field
              name="name"
              label="Name"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
            />
            <Field
              name="lastname"
              label="Lastname"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="lastname"
            />
            <Field
              name="email"
              label="E-mail"
              type="email"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="email"
            />

            <div className={classes.buttons}>
              <Button
                onClick={() => subformik.submitForm()}
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Invite User
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    );
  }

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
                },
                {
                  icon: () => <Email />,
                  isFreeAction: true,
                  tooltip: "Add user by email",
                  onClick: () => setSendUserEmail(true)
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
