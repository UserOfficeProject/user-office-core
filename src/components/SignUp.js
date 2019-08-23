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
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { Redirect } from "react-router-dom";
import FormikDropdown from "./FormikDropdown";
import nationalities from "../model/nationalities";
import dateformat from "dateformat";
import { Card, CardContent } from "@material-ui/core";

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
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: theme.palette.secondary.main
  },
  heading: {
    textAlign: "center"
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  gridRoot: {
    flexGrow: 1
  },
  cardHeader: {
    fontSize: "18px",
    padding: "22px 0 0 12px"
  },
  card: {
    margin: "30px 0"
  }
}));

export default function SignUp() {
  const classes = useStyles();
  const [userID, setUserID] = useState(null);
  const nationalitiesList = nationalities.NATIONALITIES.map(nationality => {
    return { text: nationality, value: nationality };
  });

  const sendSignUpRequest = values => {
    const query = `mutation(
                            $user_title: String, 
                            $firstname: String!, 
                            $middlename: String, 
                            $lastname: String!, 
                            $username: String!, 
                            $password: String!,
                            $preferredname: String,
                            $orcid: String!,
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
                    createUser(
                              user_title: $user_title, 
                              firstname: $firstname, 
                              middlename: $middlename, 
                              lastname: $lastname, 
                              username: $username, 
                              password: $password,
                              preferredname: $preferredname
                              orcid: $orcid
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
    request("/graphql", query, values).then(data =>
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
          user_title: "",
          firstname: "",
          middlename: "",
          lastname: "",
          username: "",
          password: "",
          preferredname: "",
          orcid: "",
          gender: "",
          nationality: "",
          birthdate: dateformat(
            new Date().setFullYear(new Date().getFullYear() - 30),
            "yyyy-mm-dd"
          ),
          organisation: "",
          department: "",
          organisation_address: "",
          position: "",
          email: "",
          telephone: "",
          telephone_alt: ""
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
            .max(20, "Username must be at most 20 characters")
            .required("Username must be at least 2 characters"),
          password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .max(25, "Password must be at most 25 characters")
            .required("Password must be at least 8 characters"),
          orcid: Yup.string()
            .min(8, "ORCID must be at least 8 characters")
            .required("ORCID must be at least 8 characters"),
          gender: Yup.string().required("please specify your gender"),
          nationality: Yup.string().required("please specify your nationality"),
          birthdate: Yup.date()
            .max(new Date())
            .required("Please specify your birth date"),
          organisation: Yup.string()
            .min(2, "organisation must be at least 2 characters")
            .max(50, "organisation must be at most 50 characters")
            .required("organisation must be at least 2 characters"),
          department: Yup.string()
            .min(2, "department must be at least 2 characters")
            .max(50, "department must be at most 50 characters")
            .required("department must be at least 2 characters"),
          organisation_address: Yup.string()
            .min(2, "organisation address must be at least 2 characters")
            .max(100, "organisation must be at most 100 characters")
            .required("organisation must be at least 2 characters"),
          position: Yup.string()
            .min(2, "position must be at least 2 characters")
            .max(30, "position must be at most 30 characters")
            .required("position must be at least 2 characters"),
          email: Yup.string()
            .email("email is in correct format")
            .required("please specify email"),
          telephone: Yup.string()
            .min(2, "telephone must be at least 2 characters")
            .max(20, "telephone must be at most 20 characters")
            .required("telephone must be at least 2 characters"),
          telephone_alt: Yup.string()
            .min(2, "telephone must be at least 2 characters")
            .max(20, "telephone must be at most 20 characters")
        })}
      >
        <Form>
          <CssBaseline />
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography component="h1" variant="h5" className={classes.heading}>
            Sign Up
          </Typography>

          <Card className={classes.card}>
            <Typography className={classes.cardHeader}>
              Login details
            </Typography>
            <CardContent>
              <Field
                name="username"
                label="Username"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
                autoComplete="off"
              />
              <Field
                name="password"
                label="Password"
                type="password"
                component={TextField}
                margin="normal"
                fullWidth
                autoComplete="off"
              />
            </CardContent>
          </Card>

          <Card className={classes.card}>
            <Typography className={classes.cardHeader}>
              Personal details
            </Typography>
            <CardContent>
              <Field
                name="firstname"
                label="Firstname"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
              />
              <Field
                name="middlename"
                label="Middle name"
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
                name="preferredname"
                label="Preferred name"
                type="text"
                component={TextField}
                margin="normal"
                fullWidth
              />
              <FormikDropdown
                name="gender"
                label="Gender"
                items={[
                  { text: "Female", value: "female" },
                  { text: "Male", value: "male" },
                  { text: "Rather not say", value: "unspecified" }
                ]}
              />
              <FormikDropdown
                name="nationality"
                label="Nationality"
                items={nationalitiesList}
              />
              <Field
                name="birthdate"
                label="Birthdate"
                type="date"
                component={TextField}
                margin="normal"
                fullWidth
              />
            </CardContent>
          </Card>

          <Card className={classes.card}>
            <Typography className={classes.cardHeader}>
              Organization details
            </Typography>
            <CardContent>
              <Grid container spacing={1}>
                <Field
                  name="orcid"
                  label="ORCID"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
                <Field
                  name="organisation"
                  label="Organisation"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
                <Field
                  name="department"
                  label="Department"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
                <Field
                  name="organisation_address"
                  label="Organization address"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
                <Field
                  name="position"
                  label="Position"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
              </Grid>
            </CardContent>
          </Card>

          <Card className={classes.card}>
            <Typography className={classes.cardHeader}>
              Contact details
            </Typography>
            <CardContent>
              <Grid container spacing={1}>
                <Field
                  name="email"
                  label="E-mail"
                  type="email"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
                <Field
                  name="telephone"
                  label="Telephone"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
                <Field
                  name="telephone_alt"
                  label="Telephone Alt."
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                />
              </Grid>
            </CardContent>
          </Card>

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
              <Link to="/SignIn/">Have an account? Sign In</Link>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </Container>
  );
}
