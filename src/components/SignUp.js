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
import FormikDropdown from "./FormikDropdown";
import nationalities from "../model/nationalities";
import dateformat from "dateformat";
import { Card, CardContent } from "@material-ui/core";
import { useOrcIDInformation } from "../hooks/useOrcIDInformation";
import orcid from "../images/orcid.png";

const queryString = require("query-string");

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
  orcButton: {
    "&:hover": {
      border: "1px solid #338caf",
      color: "#338caf"
    },
    border: "1px solid #D3D3D3",
    padding: ".3em",
    "background-color": "#fff !important",
    "border-radius": "8px",
    "box-shadow": "1px 1px 3px #999",
    cursor: "pointer",
    color: "#999",
    "font-weight": "bold",
    "font-size": ".8em",
    "line-height": "24px",
    "vertical-align": "middle"
  },

  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  orcidIcon: {
    display: "block",
    margin: "0 .5em 0 0",
    padding: 0,
    float: "left"
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

export default function SignUp(props) {
  const classes = useStyles();
  const [userID, setUserID] = useState(null);
  let authCodeOrcID = queryString.parse(props.location.search).code;
  const { loading, orcData } = useOrcIDInformation(authCodeOrcID);
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
                            $orcidHash: String!,
                            $refreshToken: String!,
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
                              orcidHash: $orcidHash
                              refreshToken: $refreshToken
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
    request("/graphql", query, {
      ...values,
      orcid: orcData.orcid,
      orcidHash: orcData.orcidHash,
      refreshToken: orcData.refreshToken
    }).then(data => setUserID(data.createUser.user.id));
  };

  if (authCodeOrcID && loading) {
    return <p>loading</p>;
  }
  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          user_title: "",
          firstname: orcData ? orcData.firstname : "",
          middlename: "",
          lastname: orcData ? orcData.lastname : "",
          username: "",
          password: "",
          preferredname: "",
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
          user_title: Yup.string().required("User title is required"),
          password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .max(25, "Password must be at most 25 characters")
            .required("Password must be at least 8 characters"),
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
            .max(50, "position must be at most 50 characters")
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
          {userID ? (
            <p>
              A activation mail has been sent to the specified email, please
              verify before login.
            </p>
          ) : (
            <React.Fragment>
              <Card className={classes.card}>
                <Typography className={classes.cardHeader}>
                  {orcData ? "Found OrcID" : "Register OrcID"}
                </Typography>
                <CardContent>
                  {orcData ? (
                    <p>{orcData.orcid}</p>
                  ) : (
                    <React.Fragment>
                      <p>
                        ESS is collecting your ORCID iD so we can verify and
                        update your record. When you click the “Register”
                        button, we will ask you to share your iD using an
                        authenticated process: either by registering for an
                        ORCID iD or, if you already have one, by signing into
                        your ORCID account, then granting us permission to get
                        your ORCID iD. We do this to ensure that you are
                        correctly identified and securely connecting your ORCID
                        iD.
                      </p>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.orcButton}
                        onClick={() =>
                          (window.location.href =
                            process.env.REACT_APP_ORCID_REDIRECT)
                        }
                      >
                        <img
                          className={classes.orcidIcon}
                          src={orcid}
                          width="24"
                          height="24"
                          alt="ORCID iD icon"
                        />
                        Register your ORCID iD
                      </Button>
                    </React.Fragment>
                  )}
                </CardContent>
              </Card>
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
                    data-cy="username"
                  />
                  <Field
                    name="password"
                    label="Password"
                    type="password"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    autoComplete="off"
                    data-cy="password"
                  />
                </CardContent>
              </Card>

              <Card className={classes.card}>
                <Typography className={classes.cardHeader}>
                  Personal details
                </Typography>

                <CardContent>
                  <FormikDropdown
                    name="user_title"
                    label="Title"
                    items={[
                      { text: "Ms.", value: "Ms." },
                      { text: "Mr.", value: "Mr." },
                      { text: "Dr.", value: "Dr." },
                      { text: "Rather not say", value: "unspecified" }
                    ]}
                    data-cy="title"
                  />
                  <Field
                    name="firstname"
                    label="Firstname"
                    type="text"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    data-cy="firstname"
                  />
                  <Field
                    name="middlename"
                    label="Middle name"
                    type="text"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    data-cy="middlename"
                  />
                  <Field
                    name="lastname"
                    label="Lastname"
                    type="text"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    data-cy="lastname"
                  />
                  <Field
                    name="preferredname"
                    label="Preferred name"
                    type="text"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    data-cy="preferredname"
                  />
                  <FormikDropdown
                    name="gender"
                    label="Gender"
                    items={[
                      { text: "Female", value: "female" },
                      { text: "Male", value: "male" },
                      { text: "Rather not say", value: "unspecified" }
                    ]}
                    data-cy="gender"
                  />
                  <FormikDropdown
                    name="nationality"
                    label="Nationality"
                    items={nationalitiesList}
                    data-cy="nationality"
                  />
                  <Field
                    name="birthdate"
                    label="Birthdate"
                    type="date"
                    component={TextField}
                    margin="normal"
                    fullWidth
                    data-cy="birthdate"
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
                      name="organisation"
                      label="Organisation"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="organisation"
                    />
                    <Field
                      name="department"
                      label="Department"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="department"
                    />
                    <Field
                      name="organisation_address"
                      label="Organization address"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="organisation-address"
                    />
                    <Field
                      name="position"
                      label="Position"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="position"
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
                      data-cy="email"
                    />
                    <Field
                      name="telephone"
                      label="Telephone"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="telephone"
                    />
                    <Field
                      name="telephone_alt"
                      label="Telephone Alt."
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="telephone-alt"
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
                data-cy="submit"
              >
                Sign Up
              </Button>
            </React.Fragment>
          )}
          <Grid container>
            <Grid item>
              <Link to="/SignIn/">
                {userID ? "Click here for sign in" : "Have an account? Sign I"}
              </Link>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </Container>
  );
}
