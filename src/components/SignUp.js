import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { request } from "graphql-request";
import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import { TextField, Select } from "formik-material-ui";
import { MenuItem } from '@material-ui/core';
import * as Yup from "yup";
import { Redirect } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    marginTop: theme.spacing(8),
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
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));



export default function SignUp() {
  const classes = useStyles();
  const [userID, setUserID] = useState(null);

  const titles = ["Mr.", "Ms.", "Dr."];

  const sendSignUpRequest = values => {
    const { firstname, lastname, username, password, title } = values;
    const query = `mutation($title: String!, $firstname: String!, $lastname: String!, $username: String!, $password: String!){
          createUser(title: $title, firstname: $firstname, lastname: $lastname, username: $username, password: $password){
            user{
              id
            }
            error
          }
        }`;
    const variables = {
      title,
      firstname,
      lastname,
      username,
      password
    };

    request("/graphql", query, variables).then(data =>
      setUserID(data.createUser.user.id)
    );
  };
  if (userID) {
    return <Redirect to="/SignIn/" />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          title: "",
          firstname: "",
          lastname: "",
          username: "",
          password: ""
        }}
        onSubmit={async (values, actions) => {
          await sendSignUpRequest(values);
          actions.setSubmitting(false);
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string()
            .min(2, "firstname must be at least 2 characters")
            .max(15, "firstname must be at most 15 characters")
            .required("firstname must be at least 2 characters"),
          lastname: Yup.string()
            .min(2, "lastname must be at least 2 characters")
            .max(15, "lastname must be at most 15 characters")
            .required("lastname must be at least 2 characters"),
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
              Sign Up
            </Typography>

            <Field
              type="text"
              name="title"
              label="Title"
              select
              margin="normal"
              component={TextField}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            >
              {titles.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Field>
            <Field
              name="firstname"
              label="Firstname"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
            />
            <Field
              name="lastname"
              label="Lastname"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
            />
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Sign Up
            </Button>
            <Grid container>
              <Grid item>
                <Link to="/SignIn/">{"Have an account? Sign In"}</Link>
              </Grid>
            </Grid>
          </div>
        </Form>
      </Formik>
    </Container>
  );
}
