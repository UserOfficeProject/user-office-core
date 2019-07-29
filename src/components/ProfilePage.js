import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { useDataAPI } from "../hooks/useDataAPI";

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

export default function ProfilePage({ match, history }) {
  const [userData, setUserData] = useState(null);
  const sendRequest = useDataAPI();

  const sendUserUpdate = values => {
    const query = `
    mutation($id: ID!, $firstname: String!, $lastname: String!) {
      updateUser(id: $id, firstname: $firstname, lastname: $lastname){
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
      lastname: values.lastname
    };
    sendRequest(query, variables).then(data => console.log(data));
  };

  useEffect(() => {
    const getUserInformation = id => {
      const query = `
      query($id: ID!) {
        user(id: $id){
          firstname
          lastname
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
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Formik
                initialValues={{
                  firstname: userData.firstname,
                  lastname: userData.lastname
                }}
                onSubmit={(values, actions) => {
                  actions.setStatus({
                    success: "Updating"
                  });
                  sendUserUpdate(values);
                  actions.setStatus({
                    success: "Updated"
                  });
                  actions.setSubmitting(false);
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
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  isSubmitting,
                  status
                }) => (
                  <Form>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} alignContent="center">
                        {status ? status.success : ""}
                      </Grid>

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
