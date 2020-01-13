import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import MaterialTable from "material-table";
import RoleModal from "./../RoleModal";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { useDataAPI } from "../../hooks/useDataAPI";
import AddBox from "@material-ui/icons/AddBox";
import { tableIcons } from "../../utils/materialIcons"
import { useSnackbar } from 'notistack';

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

export default function UpdateUserRoles(props:{id: number}) {
  const [userData, setUserData] = useState(null);
  const [modalOpen, setOpen] = useState(false);
  const sendRequest = useDataAPI();
  const { enqueueSnackbar } = useSnackbar();
  const [roles, setRoles] = useState<any>([]);

  const addRole = (role: any) => {
    setRoles([...roles, role]);
    setOpen(false);
  };

  const removeRole = (role: any) => {
    let newRoles = [...roles];
    newRoles.splice(newRoles.findIndex(element => role.id === element.id), 1);
    setRoles(newRoles);
  };

  const sendUserUpdate = () => {
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
      id: props.id,
      roles: roles.map((role: any) => role.id)
    };
    sendRequest(query, variables).then(() => enqueueSnackbar('Updated Roles', { 
      variant: 'success',
  }));
  };

  useEffect(() => {
    const getUserInformation = () => {
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
        id: props.id
      };
      sendRequest(query, variables).then((data:any) => {
        setUserData({ ...data.user });
        setRoles(data.user.roles);
      });
    };
    getUserInformation();
  }, [props.id, sendRequest]);

  const columns = [{ title: "Name", field: "name" }];

  const classes = useStyles();

  if (!userData) {
    return <p>Loading</p>;
  }
  return (
      <Container maxWidth="lg" className={classes.container}>
        <Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <RoleModal
                show={modalOpen}
                close={() => setOpen(false)}
                add={addRole}
              />
                    <MaterialTable
                      title="Roles"
                      columns={columns}
                      icons={tableIcons}
                      data={roles.map((role: any) => {
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
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => sendUserUpdate()}
                      >
                        Update Roles
                      </Button>
                    </div>

            </Paper>
          </Grid>
        </Grid>
      </Container>
  );
}
