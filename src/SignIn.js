import React, { useContext, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import { TextField } from "formik-material-ui";
import { Link } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import { request } from "graphql-request";
import { AppContext } from "./App";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100vh"
  },
  image: {
    backgroundImage:
      "url(https://lh3.googleusercontent.com/-M6eItc6QC1k/XS8Gew8sG8I/AAAAAAAANmo/_7-Tnmk8jKU6CSwcrB32-UAM0PnQMLMDQCK8BGAs/s0/2019-07-17.png)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
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
  }
}));

export default function SignInSide() {
  const classes = useStyles();
  const [failedLogin, setFailed] = useState(false);
  const { userData, setUserData } = useContext(AppContext);
  const requestToken = values => {
    const { username, password } = values;
    const query = `
    mutation($username: String!, $password: String!){
      login(username: $username, password: $password){
        user{
          id
          firstname
          lastname
          username
          proposals{
            id
            abstract
            title
          }
          roles{
            id
            title
            shortCode
          }
        }
        token
      }
    }
    `;

    const variables = {
      username,
      password
    };

    request("/graphql", query, variables)
      .then(data =>
        data.login.token ? setUserData(data.login) : setFailed(true)
      )
      .catch(error => setFailed(true));
  };

  if (userData) {
    return <Redirect to="/" />;
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={async (values, actions) => {
              await requestToken(values);
              actions.setSubmitting(false);
            }}
            validationSchema={Yup.object().shape({
              username: Yup.string()
                .min(2, "Username must be at least 2 characters")
                .max(15, "Username must be at most 15 characters")
                .required("Username must be at least 2 characters"),
              password: Yup.string()
                .min(8, "Password must be at least 8 characters")
                .max(25, "Password must be at most 25 characters")
                .required("Password must be at least 8 characters")
            })}
          >
            <Form>
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
                  <p className={classes.errorMessage}>Wrong Credentials</p>
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
                  <Grid item>
                    <Link to="/SignUp/">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </div>
            </Form>
          </Formik>
        </div>
      </Grid>
    </Grid>
  );
}
