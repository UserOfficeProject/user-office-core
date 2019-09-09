import React, { useContext, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import { TextField } from "formik-material-ui";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { request } from "graphql-request";
import { UserContext } from "../context/UserContextProvider";
import { Formik, Field, Form } from "formik";
import PhotoInSide from "./PhotoInSide";
import * as Yup from "yup";

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

export default function SignInSide() {
  const classes = useStyles();
  const [failedLogin, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { handleLogin, token } = useContext(UserContext);

  const requestToken = values => {
    const { username, password } = values;
    const query = `
    mutation($username: String!, $password: String!){
      login(username: $username, password: $password){
        token
        error
      }
    }
    `;

    const variables = {
      username,
      password
    };

    request("/graphql", query, variables)
      .then(data => {
        if (!data.login.error) {
          handleLogin(data.login.token);
        } else {
          if (data.login.error === "WRONG_USERNAME_OR_PASSWORD") {
            setErrorMessage("Wrong password or username");
          } else if (data.login.error === "EMAIL_NOT_VERIFIED") {
            setErrorMessage("Verify email before login");
          }
          setFailed(true);
        }
      })
      .catch(error => setFailed(true));
  };

  if (token) {
    return <Redirect to="/" />;
  }

  return (
    <PhotoInSide>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, actions) => {
          await requestToken(values);
          actions.setSubmitting(false);
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .min(2, "Username must be at least 2 characters")
            .max(20, "Username must be at most 20 characters")
            .required("Username must be at least 2 characters"),
          password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .max(25, "Password must be at most 25 characters")
            .required("Password must be at least 8 characters")
        })}
      >
        <Form className={classes.form}>
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Field
              name="username"
              label="Username"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
            />
            <Field
              name="password"
              label="Password"
              type="password"
              component={TextField}
              margin="normal"
              fullWidth
            />
            {failedLogin && (
              <p className={classes.errorMessage}>{errorMessage}</p>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="/ResetPasswordEmail/">Forgot password?</Link>
              </Grid>
              <Grid item>
                <Link to="/SignUp/">Don't have an account? Sign Up</Link>
              </Grid>
            </Grid>
          </div>
        </Form>
      </Formik>
    </PhotoInSide>
  );
}
