import React, {useContext, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Link } from "react-router-dom";
import {AppContext } from "./App"
import { request } from 'graphql-request'
import { Formik, Field, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';
import { Redirect } from 'react-router-dom';


const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  errorMessage: {
    color: "red"
  }
}));

export default function SignIn() {
  const classes = useStyles();
  const [failedLogin, setFailed] = useState(false);
  const {token, setToken} = useContext(AppContext);
  const requestToken = (values) =>{ 
    const {username, password} = values;
    const query = `
    mutation($username: String!, $password: String!){
      login(username: $username, password: $password)
    }
    `;
  
    const variables = {
      username,
      password
    }

      request('/graphql', query, variables).then(data => setToken(data.login)).catch((error) => setFailed(true));
  }

  if (token) {
    return <Redirect to="/" />;
  }

  return (
    <Container component="main" maxWidth="xs">
        <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, actions ) => {
          await requestToken(values)
          actions.setSubmitting(false)
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .min(2,'Username must be at least 2 characters')
            .max(15, 'Username must be at most 15 characters')
            .required('Username must be at least 2 characters'),
          password: Yup.string()
            .min(8,'Password must be at least 8 characters')
            .max(25, 'Password must be at most 25 characters')
            .required('Password must be at least 8 characters')
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
          {failedLogin && <p className={classes.errorMessage} >Wrong Credentials</p>}
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
    </Container>
  );
}