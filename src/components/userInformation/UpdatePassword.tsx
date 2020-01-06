import React, { useState } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { TextField } from "formik-material-ui";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/styles";
import { Formik, Form, Field } from "formik";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { useDataAPI } from "../../hooks/useDataAPI";
import {
  userPasswordFieldSchema
} from "../../utils/userFieldValidationSchema";
import Notification from "./../Notification";
import { getTranslation } from "../../submodules/duo-localisation/StringResources";

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
  },
  orcidIconSmall: {
    "vertical-align": "middle",
    "margin-right": "4px",
    width: "16px",
    height: "16px",
    border: "0px"
  },
  orcIdContainer: {
    "margin-top": "16px",
    "margin-bottom": "19px"
  }
});

export default function UpdatePassword(props:{id: number}) {
  const sendRequest = useDataAPI();
  const [state, setState] = useState({
    open: false,
    message: "",
    variant: "success"
  });

  const sendPasswordUpdate = (password:string) => {
    const query = `
      mutation(
        $id: Int!,
        $password: String!, 
        )
      {
        updatePassword(
          id: $id, 
          password: $password, 
        )
        {
          error
        }
      }`;
    const variables = {
      id: props.id,
      password
    };
    sendRequest(query, variables).then((data:any) => {
      if (data.error) {
        setState({
          open: true,
          variant: "error",
          message: getTranslation(data.error)
        });
      } else {
        setState({
          open: true,
          variant: "success",
          message: "Password Updated"
        });
      }
    });
  };


  const classes = useStyles();

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
                          helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
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
