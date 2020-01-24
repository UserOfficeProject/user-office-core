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
import * as Yup from "yup";
import { useDataApi } from "../hooks/useDataApi";

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
  sentMessageSuccess: {
    color: "green"
  },
  sentMessageError: {
    color: "red"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

export default function ResetPasswordEmail() {
  const classes = useStyles();
  const [emailSuccess, setSuccess] = useState(null);
  const requestResetEmail = values => {
    const api = useDataApi();
    api()
      .resetPasswordEmail({ email: values.email })
      .then(data => setSuccess(data.resetPasswordEmail));
  };

  return (
    <PhotoInSide>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values, actions) => {
          await requestResetEmail(values);
          actions.setSubmitting(false);
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email("Please enter a valid email")
            .required("Please enter an email")
        })}
      >
        <Form className={classes.form}>
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Reset Password
            </Typography>
            <Field
              name="email"
              label="Email"
              type="email"
              component={TextField}
              margin="normal"
              fullWidth
            />
            {emailSuccess !== null &&
              (emailSuccess ? (
                <p className={classes.sentMessageSuccess}>
                  A mail has been sent to the provided email.
                </p>
              ) : (
                <p className={classes.sentMessageError}>
                  No account found for this email address.
                </p>
              ))}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Send Email
            </Button>
            <Grid container>
              <Grid item>
                <Link to="/SignIn/">Have an account? Sign In</Link>
              </Grid>
            </Grid>
          </div>
        </Form>
      </Formik>
    </PhotoInSide>
  );
}
