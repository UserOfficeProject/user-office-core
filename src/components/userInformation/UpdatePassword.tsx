import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import { useSnackbar } from "notistack";
import React from "react";
import { useDataApi2 } from "../../hooks/useDataApi2";
import { userPasswordFieldSchema } from "../../utils/userFieldValidationSchema";

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

export default function UpdatePassword(props: { id: number }) {
  const api = useDataApi2();
  const { enqueueSnackbar } = useSnackbar();
  const sendPasswordUpdate = (password: string) => {
    api()
      .updatePassword({ id: props.id, password })
      .then(data =>
        enqueueSnackbar("Updated Password", {
          variant: data.updatePassword.error ? "error" : "success"
        })
      );
  };

  const classes = useStyles();

  return (
    <React.Fragment>
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
