import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import { Formik, Form } from "formik";
import MaterialTable from "material-table";
import RoleModal from "./RoleModal";
import { withRouter } from "react-router-dom";
import { tableIcons } from "../utils/tableIcons";
import { AddBox } from "@material-ui/icons";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { useDataAPI } from "../hooks/useDataAPI";
import UpdateUserInformation from "./userInformation/UpdateUserInformation";
import UpdatePassword from "./userInformation/UpdatePassword";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  },
  paper: {
    padding: "16px",
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    marginBottom: "25px"
  },
  container: {
    paddingTop: "25px",
    paddingBottom: "25px"
  }
});

function UserPage({ match, history }) {
  const [userData, setUserData] = useState(null);
  const [modalOpen, setOpen] = useState(false);
  const sendRequest = useDataAPI();

  const [roles, setRoles] = useState([]);

  const addRole = role => {
    setRoles([...roles, role]);
    setOpen(false);
  };

  const removeRole = role => {
    let newRoles = [...roles];
    newRoles.splice(newRoles.findIndex(element => role.id === element.id), 1);
    setRoles(newRoles);
  };

  const sendUserUpdate = values => {
    const query = `
    mutation($id: Int!, $roles: [Int!]) {
      updateUser(id: $id, roles: $roles){
       user{
        id
      }
        error
      }
    }
    `;

    const variables = {
      id: parseInt(match.params.id),
      roles: roles.map(role => role.id)
    };
    sendRequest(query, variables).then(data => history.push("/PeoplePage"));
  };

  useEffect(() => {
    const getUserInformation = id => {
      const query = `
      query($id: Int!) {
        user(id: $id){
          firstname
          lastname
          roles{
            id
            shortCode
            title
          }
        }
      }`;

      const variables = {
        id
      };
      sendRequest(query, variables).then(data => {
        setUserData({ ...data.user });
        setRoles(data.user.roles);
      });
    };
    getUserInformation(parseInt(match.params.id));
  }, [match.params.id, sendRequest]);

  const columns = [{ title: "Name", field: "name" }];

  const classes = useStyles();

  if (!userData) {
    return <p>Loading</p>;
  }
  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <UpdateUserInformation id={parseInt(match.params.id)} />
        <UpdatePassword id={parseInt(match.params.id)} />
        <Grid maxWidth="lg" className={classes.container}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <RoleModal
                show={modalOpen}
                close={setOpen.bind(this, false)}
                add={addRole}
              />
              <Formik
                onSubmit={(values, actions) => {
                  sendUserUpdate(values);
                  actions.setSubmitting(false);
                }}
              >
                {({ values, errors, touched, handleChange, isSubmitting }) => (
                  <Form>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>

                    <MaterialTable
                      className={classes.table}
                      title="Roles"
                      columns={columns}
                      icons={tableIcons}
                      data={roles.map(role => {
                        return { name: role.title, id: role.id };
                      })}
                      options={{
                        search: false
                      }}
                      actions={[
                        {
                          icon: () => <AddBox />,
                          tooltip: "Add Role",
                          isFreeAction: true,
                          onClick: event => setOpen(true)
                        }
                      ]}
                      editable={{
                        onRowDelete: oldData =>
                          new Promise(resolve => {
                            resolve();
                            removeRole(oldData);
                          })
                      }}
                    />

                    <div className={classes.buttons}>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        Update
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

export default withRouter(UserPage);
