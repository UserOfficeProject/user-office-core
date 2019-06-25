import React, { useState, useEffect }  from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { request } from 'graphql-request'
import MaterialTable from 'material-table';
import RoleModal from './RoleModal';
import { AddBox, Check, Clear, DeleteOutline, Edit, FilterList,ViewColumn,  ArrowUpward, Search, FirstPage, LastPage, ChevronRight, ChevronLeft, Remove, SaveAlt } from "@material-ui/icons";


const useStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px",
  },
});


export default function UserPage(props) {

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


  // A user update is needed
  const getUserInformation = (id) =>{  
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
    }`
     

    const variables = {
      id
    }
      request('/graphql', query, variables).then(data => setUserData({...data.user}));
  }

  useEffect(() => {
    getUserInformation(props.id);
  }, [props.id]);

  const addRole = (role) => {
    setUserData({
    ...userData,
    roles : [
    ...userData.roles,
    role]
    });
    setOpen(false);
};




  const columns = [
    { title: 'Name', field: 'name' },
  ];

  const classes = useStyles();

  if(!userData){
      return <p>Loading</p>
  }
  return (
    <React.Fragment>
    <RoleModal show={modalOpen} close={setOpen.bind(this, false)} add={addRole} />
    <Formik
    initialValues={{ firstname: userData.firstname, lastname: userData.lastname }}
    onSubmit={(values, actions) => {
      console.log("Update User", userData)
      
    }}
    validationSchema={Yup.object().shape({
      firstname: Yup.string()
        .min(2,'Name must be at least 2 characters')
        .max(20, 'Title must be at most 20 characters')
        .required('Name is required'),
      lastname: Yup.string()
        .min(2,'Lastname must be at least 2 characters')
        .max(20, 'Lastname must be at most 20 characters')
        .required('Lastname is required')
    })}
      >
      {({
        values,
        errors,
        touched,
        handleChange,
        isSubmitting,
      }) => (
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
            error={(touched.title && errors.title)}
            helperText={(touched.title && errors.title) && errors.title}
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
            error={(touched.abstract && errors.abstract)}
            helperText={(touched.abstract && errors.abstract) && errors.abstract}
          />
        </Grid>
      </Grid>

      <MaterialTable
        className={classes.table}
        title="Roles"
        columns={columns}
        icons={tableIcons}
        data={userData.roles.map(role => {return {name : role.title}})}
        options={{
            search: false
        }}
        actions={[
          {
          icon: () => <AddBox/>,
          tooltip: 'Add User',
          isFreeAction: true,
          onClick: (event) => setOpen(true)
          }
        ]}
        editable={{
          onRowDelete: oldData =>
          new Promise(resolve => {
            resolve();
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
    </React.Fragment>
  );
}