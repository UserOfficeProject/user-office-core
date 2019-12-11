import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import { TextField } from "formik-material-ui";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { request } from "graphql-request";
import { Formik, Field, Form } from "formik";
import PhotoInSide from "./PhotoInSide";
import { userPasswordFieldSchema } from "../utils/userFieldValidationSchema";

const useStyles = makeStyles(theme => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  sentMessage: {
    color: "green"
  },
  errorMessage: {
    color: "red"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

export default function ResetPassword({ match }) {
  const classes = useStyles();
  const [passwordReset, setPasswordReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const requestResetPassword = values => {
    const { password } = values;
    const query = `
    mutation($token: String!, $password: String!){
      resetPassword(token: $token, password: $password)
    }
    `;
    const variables = {
      token: match.params.token,
      password
    };

    request("/graphql", query, variables).then(data =>
      data.resetPassword ? setPasswordReset(true) : setErrorMessage(true)
    );
  };

  return (
    <PhotoInSide>
      <Formik
        initialValues={{ password: "" }}
        onSubmit={async (values, actions) => {
          await requestResetPassword(values);
          actions.setSubmitting(false);
        }}
        validationSchema={userPasswordFieldSchema}
      >
        <Form className={classes.form}>
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Set Password
            </Typography>
            <Field
              name="password"
              label="Password"
              type="password"
              component={TextField}
              margin="normal"
              helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
              fullWidth
            />
            <Field
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              component={TextField}
              margin="normal"
              fullWidth
            />
            {passwordReset && (
              <p className={classes.sentMessage}>
                Your password has been changed
              </p>
            )}
            {errorMessage && (
              <p className={classes.errorMessage}>
                This link has expired, please reset password again
              </p>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Set password
            </Button>
            <Grid container>
              <Grid item>
                <Link to="/SignIn/">Back to Sign In? Sign In</Link>
              </Grid>
            </Grid>
          </div>
        </Form>
      </Formik>
    </PhotoInSide>
  );
}
