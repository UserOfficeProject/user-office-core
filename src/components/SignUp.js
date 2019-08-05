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
import FormikDropdown from './FormikDropdown';
import nationalities from '../model/nationalities';

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
  const nationalitiesList = nationalities.NATIONALITIES.map(nationality => { return { text: nationality, value: nationality } });


  const sendSignUpRequest = values => {
    const { title, firstname, middlename, lastname, username, password, preferredname, orcid, gender, nationality, birthdate, organisation, department, organisation_address, position, email, telephone, telephone_alt } = values;
    const query = `mutation(
                            $title: String, 
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
                              title: $title, 
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
    const variables = {
      title,
      firstname,
      middlename,
      lastname,
      username,
      password,
      preferredname,
      orcid,
      gender,
      nationality,
      birthdate,
      organisation,
      department,
      organisation_address,
      position,
      email,
      telephone,
      telephone_alt
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
          middlename: "",
          lastname: "",
          username: "",
          password: "",
          preferredname: "",
          orcid: "",
          gender: "",
          nationality: "",
          birthdate: "",
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
          middlename: Yup.string()
            .min(2, "middlename must be at least 2 characters")
            .max(15, "middlename must be at most 15 characters")
            .required("middlename must be at least 2 characters"),
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

            <FormikDropdown
              items={[{ text: "Ms.", value: "Ms." }, { text: "Mr.", value: "Mr." }, { text: "Dr.", value: "Dr." }]}
              label="Title"
              name="title" />

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

            <Field
              name="preferredname"
              label="preferredname"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
            />
            <Field
              name="orcid"
              label="orcid"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
            />

            <FormikDropdown
              items={[{ text: "Female", value: "female" }, { text: "Male", value: "male" }, { text: "Rather not say", value: "unspecified" }]}
              label="Gender"
              name="gender" />

            <FormikDropdown
              items={nationalitiesList}
              label="Nationality"
              name="nationality" />

            <Field
              name="birthdate"
              label="birthdate"
              type="date"
              component={TextField}
              margin="normal"
              fullWidth
            />

            <Field
              name="organisation"
              label="organisation"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
            />

            <Field
              name="department"
              label="department"
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
              name="telephone_alt "
              label="Telephone Alt."
              type="text"
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
