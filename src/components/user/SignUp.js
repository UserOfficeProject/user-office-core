import { Card, CardContent } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import clsx from 'clsx';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-material-ui';
import queryString from 'query-string';
import React, { useContext, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';

import { UserContext } from '../../context/UserContextProvider';
import { useUnauthorizedApi } from '../../hooks/useDataApi';
import { useGetFields } from '../../hooks/useGetFields';
import { useGetPageContent } from '../../hooks/useGetPageContent';
import { useOrcIDInformation } from '../../hooks/useOrcIDInformation';
import orcid from '../../images/orcid.png';
import {
  userFieldSchema,
  userPasswordFieldSchema,
} from '../../utils/userFieldValidationSchema';
import { ErrorFocus } from '../common/ErrorFocus';
import FormikDropdown from '../common/FormikDropdown';
import InformationModal from '../pages/InformationModal';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  container: {
    marginBottom: theme.spacing(8),
  },
  avatar: {
    margin: theme.spacing(1),
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: theme.palette.secondary.main,
  },
  heading: {
    textAlign: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  errorBox: {
    border: `2px solid ${theme.palette.error.main}`,
  },
  agreeBox: {
    'font-size': '.8em',
  },
  errorText: {
    color: theme.palette.error.main,
  },
  requiredStar: {
    color: theme.palette.error.main,
    content: ' *',
  },
  orcidIconSmall: {
    'vertical-align': 'middle',
    'margin-right': '4px',
    width: '16px',
    height: '16px',
    border: '0px',
  },
  orcButton: {
    '&:hover': {
      border: '1px solid #338caf',
      color: theme.palette.primary.light,
    },
    border: '1px solid #D3D3D3',
    padding: '.3em',
    'background-color': '#fff !important',
    'border-radius': '8px',
    'box-shadow': '1px 1px 3px #999',
    cursor: 'pointer',
    color: '#999',
    'font-weight': 'bold',
    'font-size': '.8em',
    'line-height': '24px',
    'vertical-align': 'middle',
  },

  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  orcidIconMedium: {
    display: 'block',
    margin: '0 .5em 0 0',
    padding: 0,
    float: 'left',
    width: '24px',
    height: '24px',
  },
  gridRoot: {
    flexGrow: 1,
  },
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0 12px',
  },
  card: {
    margin: '30px 0',
  },
  cardTitle: {
    color: 'black',
  },
}));

export default function SignUp(props) {
  const classes = useStyles();
  const [userID, setUserID] = useState(null);

  const [nationalitiesList, setNationalitiesList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const { handleLogin, token } = useContext(UserContext);

  const [orcidError, setOrcidError] = useState(false);
  const [, privacyPageContent] = useGetPageContent('PRIVACYPAGE');
  const [, cookiePageContent] = useGetPageContent('COOKIEPAGE');

  const fieldsContent = useGetFields();
  const searchParams = queryString.parse(props.location.search);
  const authCodeOrcID = searchParams.code;
  const { loading, orcData } = useOrcIDInformation(authCodeOrcID);
  const unauthorizedApi = useUnauthorizedApi();

  if (orcData && orcData.token) {
    handleLogin(orcData.token);
  }

  //grab information either from URL or ORCID, with preference for orcid information
  const firstname = orcData ? orcData.firstname : searchParams.firstname;
  const lastname = orcData ? orcData.lastname : searchParams.lastname;
  const email = searchParams.email;

  //Function for redirecting user to orcid page, this adds information abouth the user in URL
  const reDirectOrcID = () => {
    window.location.href =
      process.env.REACT_APP_ORCID_REDIRECT +
      '?' +
      queryString.stringify({
        email,
        given_names: firstname,
        family_names: lastname,
      });
  };

  if (token) {
    return <Redirect to="/" />;
  }

  if (fieldsContent && !nationalitiesList.length && !institutionsList.length) {
    setInstitutionsList(
      fieldsContent.institutions.map(institution => {
        return { text: institution.value, value: institution.id };
      })
    );
    setNationalitiesList(
      fieldsContent.nationalities.map(nationality => {
        return { text: nationality.value, value: nationality.id };
      })
    );
  }

  const sendSignUpRequest = values => {
    unauthorizedApi
      .createUser({
        ...values,
        orcid: orcData.orcid,
        orcidHash: orcData.orcidHash,
        refreshToken: orcData.refreshToken,
        preferredname: values.preferredname
          ? values.preferredname
          : values.firstname,
        gender: values.gender === 'other' ? values.othergender : values.gender,
      })
      .then(data => setUserID(data.createUser.user.id));
  };

  if (authCodeOrcID && loading) {
    return <p>loading</p>;
  }

  return (
    <Container component="main" maxWidth="xs" className={classes.container}>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          user_title: '',
          firstname,
          middlename: '',
          lastname,
          password: '',
          preferredname: '',
          gender: '',
          nationality: '',
          birthdate: '',
          organisation: '',
          department: '',
          organisation_address: '',
          position: '',
          email,
          telephone: '',
          telephone_alt: '',
          privacy_agreement: false,
          cookie_policy: false,
        }}
        onSubmit={async (values, actions) => {
          if (orcData && orcData.orcid) {
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
                    [classes.errorBox]: orcidError,
                  })}
                >
                  <Typography className={classes.cardHeader}>
                    {orcData ? (
                      <FormLabel
                        classes={{
                          root: classes.cardTitle,
                        }}
                      >
                        1. ORCID iD
                      </FormLabel>
                    ) : (
                      <FormLabel
                        required
                        classes={{
                          root: classes.cardTitle,
                        }}
                      >
                        {' '}
                        1. Create or connect your ORCID iD
                      </FormLabel>
                    )}
                  </Typography>
                  <CardContent>
                    {orcData ? (
                      <a href={'https://orcid.org/' + orcData.orcid}>
                        <img
                          className={classes.orcidIconSmall}
                          src={orcid}
                          alt="ORCID iD icon"
                        />
                        https://orcid.org/{orcData.orcid}
                      </a>
                    ) : (
                      <React.Fragment>
                        <p>
                          ORCID provides a persistent identifier – an ORCID iD –
                          that distinguishes you from other researchers and a
                          mechanism for linking your research outputs and
                          activities to your iD. Learn more at orcid.org
                        </p>
                        <p>
                          Please add you ORCID iD <b>first</b>: ESS will collect
                          any information we can from ORCID before you complete
                          the rest of the sign up.
                        </p>

                        <p>
                          ESS collects your ORCID iD so we can verify your
                          record. When you click the “Register” button, we will
                          ask you to share your iD using an authenticated
                          process: either by registering for an ORCID iD or, if
                          you already have one, by signing into your ORCID
                          account, then granting us permission to get your ORCID
                          iD. We do this to ensure that you are correctly
                          identified and securely connecting your ORCID iD.
                        </p>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          className={classes.orcButton}
                          onClick={() => reDirectOrcID()}
                        >
                          <img
                            className={classes.orcidIconMedium}
                            src={orcid}
                            alt="ORCID iD icon"
                          />
                          Create or connect your ORCID iD
                        </Button>
                      </React.Fragment>
                    )}
                  </CardContent>
                </Card>
                {orcidError && (
                  <p className={classes.errorText}>OrcID is require</p>
                )}

                <Card className={classes.card}>
                  <Typography className={classes.cardHeader}>
                    2. Login details
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
                      disabled={!orcData}
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
                      helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
                      required
                      disabled={!orcData}
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
                      disabled={!orcData}
                    />
                  </CardContent>
                </Card>

                <Card className={classes.card}>
                  <Typography className={classes.cardHeader}>
                    3. Personal details
                  </Typography>

                  <CardContent>
                    <FormikDropdown
                      name="user_title"
                      label="Title"
                      items={[
                        { text: 'Ms.', value: 'Ms.' },
                        { text: 'Mr.', value: 'Mr.' },
                        { text: 'Dr.', value: 'Dr.' },
                        { text: 'Prof.', value: 'Prof.' },
                        { text: 'Rather not say', value: 'unspecified' },
                      ]}
                      data-cy="title"
                      required
                      disabled={!orcData}
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
                      disabled={!orcData}
                    />
                    <Field
                      name="middlename"
                      label="Middle name"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="middlename"
                      disabled={!orcData}
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
                      disabled={!orcData}
                    />
                    <Field
                      name="preferredname"
                      label="Preferred name"
                      type="text"
                      component={TextField}
                      margin="normal"
                      fullWidth
                      data-cy="preferredname"
                      disabled={!orcData}
                    />
                    <FormikDropdown
                      name="gender"
                      label="Gender"
                      items={[
                        { text: 'Female', value: 'female' },
                        { text: 'Male', value: 'male' },
                        { text: 'Other', value: 'other' },
                      ]}
                      data-cy="gender"
                      required
                      disabled={!orcData}
                    />
                    {values.gender === 'other' && (
                      <Field
                        name="othergender"
                        label="Please specify gender"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="othergender"
                        required
                        disabled={!orcData}
                      />
                    )}
                    <FormikDropdown
                      name="nationality"
                      label="Nationality"
                      items={nationalitiesList}
                      data-cy="nationality"
                      required
                      disabled={!orcData}
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
                      disabled={!orcData}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </CardContent>
                </Card>

                <Card className={classes.card}>
                  <Typography className={classes.cardHeader}>
                    4. Organisation details
                  </Typography>
                  <CardContent>
                    <Grid container spacing={1}>
                      <Field
                        name="position"
                        label="Position"
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="position"
                        required
                        disabled={!orcData}
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
                        disabled={!orcData}
                      />
                      <FormikDropdown
                        name="organisation"
                        label="Organisation"
                        items={institutionsList}
                        data-cy="organisation"
                        required
                        disabled={!orcData}
                      />
                      {values.organisation === 1 && (
                        <Field
                          name="otherOrganisation"
                          label="Please specify organisation"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="otherOrganisation"
                          required
                          disabled={!orcData}
                        />
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                <Card className={classes.card}>
                  <Typography className={classes.cardHeader}>
                    5. Contact details
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
                        disabled={!orcData}
                      />
                      <Field
                        name="telephone_alt"
                        label="Telephone Alt."
                        type="text"
                        component={TextField}
                        margin="normal"
                        fullWidth
                        data-cy="telephone-alt"
                        disabled={!orcData}
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
                          linkText={'Privacy Statement'}
                        />
                      </>
                    ),
                  }}
                  margin="normal"
                  data-cy="privacy-agreement"
                  disabled={!orcData}
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
                          linkText={'Cookie policy'}
                        />
                      </>
                    ),
                  }}
                  margin="normal"
                  data-cy="cookie-policy"
                  disabled={!orcData}
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
                    ? 'Click here for sign in'
                    : 'Have an account? Sign In'}
                </Link>
              </Grid>
            </Grid>
            <ErrorFocus />
          </Form>
        )}
      </Formik>
    </Container>
  );
}
