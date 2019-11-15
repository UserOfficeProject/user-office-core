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
import { TextField, CheckboxWithLabel } from "formik-material-ui";
import FormikDropdown from "./FormikDropdown";
import nationalities from "../models/nationalities";
import dateformat from "dateformat";
import { Card, CardContent } from "@material-ui/core";
import { useOrcIDInformation } from "../hooks/useOrcIDInformation";
import InformationModal from "./InformationModal";
import { useGetPageContent } from "../hooks/useGetPageContent";
import orcid from "../images/orcid.png";
import clsx from "clsx";
import {
  userFieldSchema,
  userPasswordFieldSchema
} from "../utils/userFieldValidationSchema";

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
  errorBox: {
    border: "2px solid red"
  },
  agreeBox: {
    "font-size": ".7em"
  },
  errorText: {
    color: "red"
  },
  requiredStar: {
    color: "red",
    content: " *"
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
  const [orcidError, setOrcidError] = useState(false);
  const [loadingPrivacyContent, privacyPageContent] = useGetPageContent(
    "PRIVACYPAGE"
  );
  const [loadingCookieContent, cookiePageContent] = useGetPageContent(
    "COOKIEPAGE"
  );
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
      refreshToken: orcData.refreshToken,
      preferredname: values.preferredname
        ? values.preferredname
        : values.firstname,
      gender: values.gender === "other" ? values.othergender : values.gender
    }).then(data => setUserID(data.createUser.user.id));
  };

  if (authCodeOrcID && loading) {
    return <p>loading</p>;
  }
  return (
    <Container component="main" maxWidth="xs">
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          user_title: "",
          firstname: orcData ? orcData.firstname : "",
          middlename: "",
          lastname: orcData ? orcData.lastname : "",
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
          telephone_alt: "",
          privacy_agreement: false,
          cookie_policy: false
        }}
        onSubmit={async (values, actions) => {
          if (orcData && orcData.orcid && !orcData.registered) {
            await sendSignUpRequest(values);
          } else {
            setOrcidError(true);
          }
          actions.setSubmitting(false);
        }}
        validationSchema={userFieldSchema.concat(userPasswordFieldSchema)}
      >
        {({ values }) => (
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
                <Card
                  className={clsx({
                    [classes.card]: true,
                    [classes.errorBox]: orcidError
                  })}
                >
                  <Typography className={classes.cardHeader}>
                    {orcData ? (
                      "Found OrcID"
                    ) : (
                      <>
                        Register OrcID
                        <span class="MuiFormLabel-asterisk MuiInputLabel-asterisk">
                          &thinsp;*
                        </span>
                      </>
                    )}
                  </Typography>
                  <CardContent>
                    {orcData && !orcData.registered ? (
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
                          correctly identified and securely connecting your
                          ORCID iD.
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
                {orcidError && (
                  <p className={classes.errorText}>OrcID is require</p>
                )}
                {orcData && orcData.registered && (
                  <p className={classes.errorText}>
                    OrcID has been registered before
                  </p>
                )}
                <Card className={classes.card}>
                  <Typography className={classes.cardHeader}>
                    Login details
                  </Typography>
                  <CardContent>
                    <Field
                      name="email"
                      label="E-mail"
                      type="email"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="email"
                      required
                      disabled={!orcData || orcData.registered}
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
                      helperText="Password must contain at least 12 characters (including upper case, lower case, numbers and special characters)"
                      required
                      disabled={!orcData || orcData.registered}
                    />
                    <Field
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      autoComplete="off"
                      data-cy="confirmPassword"
                      required
                      disabled={!orcData || orcData.registered}
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
                        { text: "Prof.", value: "Prof." },
                        { text: "Rather not say", value: "unspecified" }
                      ]}
                      data-cy="title"
                      required
                      disabled={!orcData || orcData.registered}
                    />
                    <Field
                      name="firstname"
                      label="First name"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="firstname"
                      required
                      disabled={!orcData || orcData.registered}
                    />
                    <Field
                      name="middlename"
                      label="Middle name"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="middlename"
                      disabled={!orcData || orcData.registered}
                    />
                    <Field
                      name="lastname"
                      label="Last name"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="lastname"
                      required
                      disabled={!orcData || orcData.registered}
                    />
                    <Field
                      name="preferredname"
                      label="Preferred name"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="preferredname"
                      disabled={!orcData || orcData.registered}
                    />
                    <FormikDropdown
                      name="gender"
                      label="Gender"
                      items={[
                        { text: "Female", value: "female" },
                        { text: "Male", value: "male" },
                        { text: "Other", value: "other" }
                      ]}
                      data-cy="gender"
                      required
                      disabled={!orcData || orcData.registered}
                    />
                    {values.gender === "other" && (
                      <Field
                        name="othergender"
                        label="Please specify gender"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="othergender"
                        required
                        disabled={!orcData || orcData.registered}
                      />
                    )}
                    <FormikDropdown
                      name="nationality"
                      label="Nationality"
                      items={nationalitiesList}
                      data-cy="nationality"
                      required
                      disabled={!orcData || orcData.registered}
                    />
                    <Field
                      name="birthdate"
                      label="Birthdate"
                      type="date"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="birthdate"
                      required
                      disabled={!orcData || orcData.registered}
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
                        label="Organization"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="organisation"
                        required
                        disabled={!orcData || orcData.registered}
                      />
                      <Field
                        name="department"
                        label="Department"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="department"
                        required
                        disabled={!orcData || orcData.registered}
                      />
                      <Field
                        name="organisation_address"
                        label="Organization address"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="organisation-address"
                        required
                        disabled={!orcData || orcData.registered}
                      />
                      <Field
                        name="position"
                        label="Position"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="position"
                        required
                        disabled={!orcData || orcData.registered}
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
                        name="telephone"
                        label="Telephone"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="telephone"
                        required
                        disabled={!orcData || orcData.registered}
                      />
                      <Field
                        name="telephone_alt"
                        label="Telephone Alt."
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="telephone-alt"
                        disabled={!orcData || orcData.registered}
                      />
                    </Grid>
                  </CardContent>
                </Card>
                <Field
                  name="privacy_agreement"
                  className={classes.agreeBox}
                  component={CheckboxWithLabel}
                  Label={{
                    classes: { label: classes.agreeBox },
                    label: (
                      <>
                        I confirm that I have read, consent and agree to the
                        DEMAX
                        <InformationModal
                          text={privacyPageContent}
                          linkText={"Privacy Statement"}
                        />
                      </>
                    )
                  }}
                  margin="normal"
                  fullWidth
                  data-cy="privacy-agreement"
                  disabled={!orcData || orcData.registered}
                />
                <Field
                  name="cookie_policy"
                  className={classes.agreeBox}
                  component={CheckboxWithLabel}
                  Label={{
                    classes: { label: classes.agreeBox },
                    label: (
                      <>
                        I consent to the DEMAX
                        <InformationModal
                          text={cookiePageContent}
                          linkText={"Cookie policy"}
                        />
                      </>
                    )
                  }}
                  margin="normal"
                  fullWidth
                  data-cy="cookie-policy"
                  disabled={!orcData || orcData.registered}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  data-cy="submit"
                  disabled={!values.privacy_agreement || !values.cookie_policy}
                >
                  Sign Up
                </Button>
              </React.Fragment>
            )}
            <Grid container>
              <Grid item>
                <Link to="/SignIn/">
                  {userID
                    ? "Click here for sign in"
                    : "Have an account? Sign In"}
                </Link>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
