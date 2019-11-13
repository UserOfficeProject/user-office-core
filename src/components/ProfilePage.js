import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { TextField } from "formik-material-ui";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import { Formik, Form, Field } from "formik";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { useDataAPI } from "../hooks/useDataAPI";
import FormikDropdown from "./FormikDropdown";
import nationalities from "../models/nationalities";
import {
  userFieldSchema,
  userPasswordFieldSchema
} from "../utils/userFieldValidationSchema";
import Notification from "./Notification";
import dateformat from "dateformat";

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

export default function ProfilePage({ match, history }) {
  const [userData, setUserData] = useState(null);
  const sendRequest = useDataAPI();
  const [state, setState] = useState({
    open: false,
    message: "",
    variant: "success"
  });
  const nationalitiesList = nationalities.NATIONALITIES.map(nationality => {
    return { text: nationality, value: nationality };
  });

  const sendPasswordUpdate = password => {
    const query = `mutation(
      $id: Int!,
      $password: String!, 
      )
{
  updatePassword(
        id: $id, 
        password: $password, 
        )
}`;
    const variables = {
      id: parseInt(match.params.id),
      password
    };
    sendRequest(query, variables).then(data => {
      if (data.updatePassword) {
        setState({
          open: true,
          variant: "success",
          message: "Password Updated"
        });
      } else {
        setState({
          open: true,
          variant: "error",
          message: "Password Update Failed"
        });
      }
    });
  };

  const sendUserUpdate = values => {
    const query = `mutation(
      $id: Int!,
      $user_title: String, 
      $firstname: String!, 
      $middlename: String, 
      $lastname: String!, 
      $preferredname: String,
      $gender: String!,
      $nationality: String!,
      $birthdate: String!,
      $organisation: String!,
      $department: String!,
      $organisation_address: String!,
      $position: String!,
      $email: String!,
      $telephone: String!,
      $telephone_alt: String
      )
{
  updateUser(
        id: $id, 
        user_title: $user_title, 
        firstname: $firstname, 
        middlename: $middlename, 
        lastname: $lastname, 
        preferredname: $preferredname
        gender: $gender
        nationality: $nationality
        birthdate: $birthdate
        organisation: $organisation
        department: $department
        organisation_address: $organisation_address
        position: $position
        email: $email
        telephone: $telephone
        telephone_alt: $telephone_alt
        )
{
  user { id }
  error
}
}`;
    const variables = {
      id: parseInt(match.params.id),
      ...values
    };
    sendRequest(query, variables).then(data => {
      if (!data.user) {
        setState({
          open: true,
          variant: "success",
          message: "User Updated"
        });
      } else {
        setState({
          open: true,
          variant: "error",
          message: "Update Failed"
        });
      }
    });
  };

  useEffect(() => {
    const getUserInformation = id => {
      const query = `
      query($id: ID!) {
        user(id: $id){
          user_title, 
          username,
          firstname, 
          middlename, 
          lastname, 
          preferredname,
          gender,
          nationality,
          birthdate,
          organisation,
          department,
          organisation_address,
          position,
          email,
          telephone,
          telephone_alt, 
        }
      }`;

      const variables = {
        id
      };
      sendRequest(query, variables).then(data => {
        setUserData({ ...data.user });
      });
    };
    getUserInformation(match.params.id);
  }, [match.params.id, sendRequest]);

  const classes = useStyles();

  if (!userData) {
    return <p>Loading</p>;
  }

  return (
    <React.Fragment>
      <Notification
        open={state.open}
        onClose={() => setState({ ...state, open: false })}
        variant={state.variant}
        message={state.message}
      />
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Formik
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={{
                  username: userData.username,
                  firstname: userData.firstname,
                  middlename: userData.middlename,
                  lastname: userData.lastname,
                  preferredname: userData.preferredname,
                  gender: userData.gender,
                  nationality: userData.nationality,
                  birthdate: dateformat(
                    new Date(parseInt(userData.birthdate)),
                    "yyyy-mm-dd"
                  ),
                  organisation: userData.organisation,
                  department: userData.department,
                  organisation_address: userData.organisation_address,
                  position: userData.position,
                  oldEmail: userData.email,
                  email: userData.email,
                  telephone: userData.telephone,
                  telephone_alt: userData.telephone_alt,
                  user_title: userData.user_title
                }}
                onSubmit={(values, actions) => {
                  sendUserUpdate(values);
                  actions.setFieldValue("oldEmail", values.email);
                  actions.setSubmitting(false);
                }}
                validationSchema={userFieldSchema}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <FormikDropdown
                          name="user_title"
                          label="Title"
                          items={[
                            { text: "Ms.", value: "Ms." },
                            { text: "Mr.", value: "Mr." },
                            { text: "Dr.", value: "Dr." },
                            { text: "Prof.", value: "Prof." },
                            { text: "Rather not say", value: "unspecified" }
                          ]}
                          data-cy="title"
                        />
                        <Field
                          name="firstname"
                          label="Firstname"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="firstname"
                        />
                        <Field
                          name="middlename"
                          label="Middle name"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="middlename"
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
                          name="preferredname"
                          label="Preferred name"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="preferredname"
                        />
                        <FormikDropdown
                          name="gender"
                          label="Gender"
                          items={[
                            { text: "Female", value: "female" },
                            { text: "Male", value: "male" },
                            { text: "Other", value: "other" }
                          ]}
                          data-cy="gender"
                        />
                        <FormikDropdown
                          name="nationality"
                          label="Nationality"
                          items={nationalitiesList}
                          data-cy="nationality"
                        />
                        <Field
                          name="birthdate"
                          label="Birthdate"
                          type="date"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="birthdate"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Field
                          name="username"
                          label="Username"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          autoComplete="off"
                          data-cy="username"
                          disabled={true}
                        />
                        <Field
                          name="organisation"
                          label="Organisation"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="organisation"
                        />
                        <Field
                          name="department"
                          label="Department"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="department"
                        />
                        <Field
                          name="organisation_address"
                          label="Organization address"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="organisation-address"
                        />
                        <Field
                          name="position"
                          label="Position"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="position"
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
                        <Field
                          name="telephone"
                          label="Telephone"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="telephone"
                        />
                        <Field
                          name="telephone_alt"
                          label="Telephone Alt."
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="telephone-alt"
                        />
                      </Grid>
                    </Grid>
                    <div className={classes.buttons}>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        Update Profile
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Paper>
            <Paper className={classes.paper}>
              <Formik
                initialValues={{
                  password: "",
                  confirmPassword: ""
                }}
                onSubmit={(values, actions) => {
                  sendPasswordUpdate(values.password);
                  actions.setSubmitting(false);
                }}
                validationSchema={userPasswordFieldSchema}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Typography variant="h6" gutterBottom>
                      Password
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Field
                          name="password"
                          label="New Password"
                          type="password"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          autoComplete="off"
                          data-cy="password"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Field
                          name="confirmPassword"
                          label="Confirm Password"
                          type="password"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          autoComplete="off"
                          data-cy="confirmPassword"
                        />
                      </Grid>
                    </Grid>
                    <div className={classes.buttons}>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        Change Password
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
