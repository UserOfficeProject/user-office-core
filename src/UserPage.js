import React, { useState, useEffect, useContext } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import MaterialTable from "material-table";
import RoleModal from "./RoleModal";
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
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { AppContext } from "./App";

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
    flexDirection: "column"
  },
  container: {
    paddingTop: "25px",
    paddingBottom: "25px"
  }
});

export default function UserPage({ match }) {
  const [userData, setUserData] = useState(null);
  const [modalOpen, setOpen] = useState(false);
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

  const { apiCall } = useContext(AppContext);
  const [roles, setRoles] = useState([]);

  const addRole = role => {
    setRoles([...roles, role]);
    setOpen(false);
  };

  const removeRole = role => {
    let newRoles = [...roles];
    newRoles.splice(newRoles.indexOf(role), 1);
    setRoles(newRoles);
  };

  const sendUserUpdate = values => {
    const query = `
    mutation($id: ID!, $firstname: String!, $lastname: String!, $roles: [Int!]) {
      updateUser(id: $id, firstname: $firstname, lastname: $lastname, roles: $roles){
       user{
        id
      }
        error
      }
    }
    `;

    const variables = {
      id: match.params.id,
      firstname: values.firstname,
      lastname: values.lastname,
      roles: roles.map(role => role.id)
    };
    apiCall(query, variables).then(data => console.log(data));
  };

  const getUserInformation = id => {
    const query = `
    query($id: ID!) {
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
    apiCall(query, variables).then(data => {
      setUserData({ ...data.user });
      setRoles(data.user.roles);
    });
  };

  useEffect(() => {
    getUserInformation(match.params.id);
  }, [match.params.id]);

  const columns = [{ title: "Name", field: "name" }];

  const classes = useStyles();

  if (!userData) {
    return <p>Loading</p>;
  }
  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <RoleModal
                show={modalOpen}
                close={setOpen.bind(this, false)}
                add={addRole}
              />
              <Formik
                initialValues={{
                  firstname: userData.firstname,
                  lastname: userData.lastname
                }}
                onSubmit={(values, actions) => {
                  sendUserUpdate(values);
                }}
                validationSchema={Yup.object().shape({
                  firstname: Yup.string()
                    .min(2, "Name must be at least 2 characters")
                    .max(20, "Title must be at most 20 characters")
                    .required("Name is required"),
                  lastname: Yup.string()
                    .min(2, "Lastname must be at least 2 characters")
                    .max(20, "Lastname must be at most 20 characters")
                    .required("Lastname is required")
                })}
              >
                {({ values, errors, touched, handleChange, isSubmitting }) => (
                  <Form>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <TextField
                          required
                          id="firstname"
                          name="firstname"
                          label="Firstname"
                          defaultValue={values.firstname}
                          fullWidth
                          onChange={handleChange}
                          error={touched.title && errors.title}
                          helperText={
                            touched.title && errors.title && errors.title
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          id="lastname"
                          name="lastname"
                          label="Lastname"
                          defaultValue={values.lastname}
                          fullWidth
                          onChange={handleChange}
                          error={touched.abstract && errors.abstract}
                          helperText={
                            touched.abstract &&
                            errors.abstract &&
                            errors.abstract
                          }
                        />
                      </Grid>
                    </Grid>

                    <MaterialTable
                      className={classes.table}
                      title="Roles"
                      columns={columns}
                      icons={tableIcons}
                      data={roles.map(role => {
                        return { name: role.title };
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
