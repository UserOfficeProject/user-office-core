import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { createUserValidationSchema } from '@user-office-software/duo-validation';
import clsx from 'clsx';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, Select, TextField } from 'formik-mui';
import { DatePicker } from 'formik-mui-lab';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { ErrorFocus } from 'components/common/ErrorFocus';
import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import UOLoader from 'components/common/UOLoader';
import InformationModal from 'components/pages/InformationModal';
import { UserContext } from 'context/UserContextProvider';
import {
  PageName,
  CreateUserMutationVariables,
  SettingsId,
  Maybe,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';
import { useGetFields } from 'hooks/user/useGetFields';
import { useOrcIDInformation } from 'hooks/user/useOrcIDInformation';
import orcid from 'images/orcid.png';
import { Option } from 'utils/utilTypes';

const useStyles = makeStyles((theme) => ({
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
    },
    border: '1px solid #D3D3D3',
    padding: '.3em',
    'background-color': '#fff !important',
    'border-radius': '8px',
    'box-shadow': '1px 1px 3px #999',
    cursor: 'pointer',
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
  orcidText: {
    color: '#1a1a1a',
    '&:hover': {
      color: '#1a1a1a',
    },
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

const SignUpPropTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

type SignUpProps = PropTypes.InferProps<typeof SignUpPropTypes>;

const SignUp: React.FC<SignUpProps> = (props) => {
  const theme = useTheme();
  const classes = useStyles();
  const [userID, setUserID] = useState<number | null>(null);
  const { format, mask } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const [nationalitiesList, setNationalitiesList] = useState<Option[]>([]);
  const [institutionsList, setInstitutionsList] = useState<Option[]>([]);
  const [countriesList, setCountriesList] = useState<Option[]>([]);
  const { handleLogin, token } = useContext(UserContext);

  const [orcidError, setOrcidError] = useState(false);
  const [, privacyPageContent] = useGetPageContent(PageName.PRIVACYPAGE);
  const [, cookiePageContent] = useGetPageContent(PageName.COOKIEPAGE);

  const fieldsContent = useGetFields();
  const { institutions, loadingInstitutions } = useInstitutionsData();
  const searchParams = queryString.parse(props.location.search);
  const authCodeOrcID = searchParams.code;
  const { loading, orcData } = useOrcIDInformation(authCodeOrcID as string);
  const unauthorizedApi = useUnauthorizedApi();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  // NOTE: User should be older than 18 years.
  const userMaxBirthDate = DateTime.now().minus({ years: 18 });

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
    history.push('/');
  }

  if (loadingInstitutions || !fieldsContent || (authCodeOrcID && loading)) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const initialValues: Omit<
    CreateUserMutationVariables,
    'gender' | 'nationality' | 'organisation' | 'organizationCountry'
  > & {
    gender: Maybe<string>;
    othergender: string;
    organisation: Maybe<number>;
    organizationCountry: Maybe<number>;
    nationality: Maybe<number>;
    confirmPassword: string;
    privacy_agreement: boolean;
    cookie_policy: boolean;
  } = {
    user_title: '',
    firstname: firstname as string,
    middlename: '',
    lastname: lastname as string,
    password: '',
    confirmPassword: '',
    preferredname: '',
    gender: '',
    othergender: '',
    nationality: null,
    birthdate: userMaxBirthDate,
    organisation: null,
    organizationCountry: null,
    department: '',
    position: '',
    email: (email as string) || '',
    telephone: '',
    telephone_alt: '',
    privacy_agreement: false,
    cookie_policy: false,
    orcid: orcData?.orcid as string,
    orcidHash: orcData?.orcidHash as string,
    refreshToken: orcData?.refreshToken as string,
  };

  const userTitleOptions: Option[] = [
    { text: 'Ms.', value: 'Ms.' },
    { text: 'Mr.', value: 'Mr.' },
    { text: 'Dr.', value: 'Dr.' },
    { text: 'Prof.', value: 'Prof.' },
    { text: 'Rather not say', value: 'unspecified' },
  ];

  const genderOptions: Option[] = [
    { text: 'Female', value: 'female' },
    { text: 'Male', value: 'male' },
    { text: 'Other', value: 'other' },
  ];

  if (!institutionsList.length) {
    setInstitutionsList(
      institutions.map((institution) => {
        return { text: institution.name, value: institution.id };
      })
    );
  }

  if (!nationalitiesList.length) {
    setNationalitiesList(
      fieldsContent.nationalities.map((nationality) => {
        return { text: nationality.value, value: nationality.id };
      })
    );
  }

  if (!countriesList.length) {
    setCountriesList(
      fieldsContent.countries.map((country) => {
        return { text: country.value, value: country.id };
      })
    );
  }

  const sendSignUpRequest = (values: CreateUserMutationVariables) => {
    return unauthorizedApi()
      .createUser({
        ...values,
      })
      .then((data) => {
        if (data.createUser.rejection) {
          enqueueSnackbar(data.createUser.rejection.reason, {
            variant: 'error',
          });
        } else {
          setUserID(data?.createUser?.user?.id as number);
        }
      });
  };

  return (
    <Container component="main" maxWidth="xs" className={classes.container}>
      <Formik
        validateOnChange={false}
        initialValues={initialValues}
        onSubmit={async (values): Promise<void> => {
          if (
            orcData &&
            orcData.orcid &&
            values.nationality &&
            values.organisation
          ) {
            const newValues = {
              ...values,
              nationality: values.nationality,
              organisation: values.organisation,
              orcid: orcData?.orcid as string,
              orcidHash: orcData?.orcidHash as string,
              refreshToken: orcData?.refreshToken as string,
              preferredname: values.preferredname
                ? values.preferredname
                : values.firstname,
              gender:
                values.gender === 'other'
                  ? values.othergender
                  : values.gender ?? '',
            };

            await sendSignUpRequest(newValues);
          } else {
            setOrcidError(true);
          }
        }}
        validationSchema={createUserValidationSchema}
      >
        {({ values, isSubmitting }) => (
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
                          className={classes.orcButton}
                          onClick={() => reDirectOrcID()}
                        >
                          <img
                            className={classes.orcidIconMedium}
                            src={orcid}
                            alt="ORCID iD icon"
                          />

                          <span className={classes.orcidText}>
                            Create or connect your ORCID iD
                          </span>
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
                      id="email-input"
                      type="email"
                      component={TextField}
                      fullWidth
                      data-cy="email"
                      required
                      disabled={!orcData}
                    />
                    <Field
                      name="password"
                      label="Password"
                      id="password-input"
                      type="password"
                      component={TextField}
                      fullWidth
                      autoComplete="new-password"
                      data-cy="password"
                      helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
                      required
                      disabled={!orcData}
                    />
                    <Field
                      name="confirmPassword"
                      label="Confirm Password"
                      id="confirm-password-input"
                      type="password"
                      component={TextField}
                      fullWidth
                      autoComplete="new-password"
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
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <FormControl fullWidth>
                        <InputLabel
                          htmlFor="user_title"
                          shrink={!!values.user_title}
                          required
                        >
                          Title
                        </InputLabel>
                        <Field
                          id="user_title"
                          name="user_title"
                          type="text"
                          component={Select}
                          data-cy="title"
                          disabled={!orcData}
                          required
                        >
                          {userTitleOptions.map(({ value, text }) => {
                            return (
                              <MenuItem value={value} key={value}>
                                {text}
                              </MenuItem>
                            );
                          })}
                        </Field>
                      </FormControl>
                      <Field
                        name="firstname"
                        label="First name"
                        id="fname-input"
                        type="text"
                        component={TextField}
                        fullWidth
                        data-cy="firstname"
                        required
                        disabled={!orcData}
                      />
                      <Field
                        name="middlename"
                        label="Middle name"
                        id="mname-input"
                        type="text"
                        component={TextField}
                        fullWidth
                        data-cy="middlename"
                        disabled={!orcData}
                      />
                      <Field
                        name="lastname"
                        label="Last name"
                        id="lname-input"
                        type="text"
                        component={TextField}
                        fullWidth
                        data-cy="lastname"
                        required
                        disabled={!orcData}
                      />
                      <Field
                        name="preferredname"
                        label="Preferred name"
                        id="pname-input"
                        type="text"
                        component={TextField}
                        fullWidth
                        data-cy="preferredname"
                        disabled={!orcData}
                      />
                      <FormControl fullWidth>
                        <InputLabel
                          htmlFor="user_title"
                          shrink={!!values.gender}
                          required
                        >
                          Gender
                        </InputLabel>
                        <Field
                          id="gender"
                          name="gender"
                          type="text"
                          component={Select}
                          data-cy="gender"
                          disabled={!orcData}
                          required
                        >
                          {genderOptions.map(({ value, text }) => {
                            return (
                              <MenuItem value={value} key={value}>
                                {text}
                              </MenuItem>
                            );
                          })}
                        </Field>
                      </FormControl>
                      {values.gender === 'other' && (
                        <Field
                          name="othergender"
                          label="Please specify gender"
                          id="gender-input"
                          type="text"
                          component={TextField}
                          fullWidth
                          data-cy="othergender"
                          required
                          disabled={!orcData}
                        />
                      )}
                      <FormikUIAutocomplete
                        name="nationality"
                        label="Nationality"
                        items={nationalitiesList}
                        disabled={!orcData}
                        noOptionsText="No items"
                        data-cy="nationality"
                        required
                      />
                      <Field
                        name="birthdate"
                        label="Birthdate"
                        id="birthdate-input"
                        inputFormat={format}
                        mask={mask}
                        inputProps={{ placeholder: format }}
                        component={DatePicker}
                        disabled={!orcData}
                        maxDate={userMaxBirthDate}
                        textField={{
                          fullWidth: true,
                          'data-cy': 'birthdate',
                          required: true,
                        }}
                        required
                        desktopModeMediaQuery={theme.breakpoints.up('sm')}
                      />
                    </LocalizationProvider>
                  </CardContent>
                </Card>

                <Card className={classes.card}>
                  <Typography className={classes.cardHeader}>
                    4. Organisation details
                  </Typography>
                  <CardContent>
                    <FormikUIAutocomplete
                      name="organisation"
                      label="Organisation"
                      items={institutionsList}
                      disabled={!orcData}
                      noOptionsText="No items"
                      data-cy="organisation"
                      required
                    />
                    {values.organisation && +values.organisation === 1 && (
                      <>
                        <Field
                          name="otherOrganisation"
                          label="Please specify organisation"
                          id="organisation-input"
                          type="text"
                          component={TextField}
                          fullWidth
                          data-cy="otherOrganisation"
                          required
                          disabled={!orcData}
                        />
                        <FormikUIAutocomplete
                          name="organizationCountry"
                          label="Please specify organization country"
                          items={countriesList}
                          data-cy="organizationCountry"
                          required
                          loading={!fieldsContent}
                          noOptionsText="No countries"
                        />
                      </>
                    )}
                    <Field
                      name="position"
                      label="Position"
                      id="position-input"
                      type="text"
                      component={TextField}
                      fullWidth
                      data-cy="position"
                      required
                      disabled={!orcData}
                    />
                    <Field
                      name="department"
                      label="Department"
                      id="department-input"
                      type="text"
                      component={TextField}
                      fullWidth
                      data-cy="department"
                      required
                      disabled={!orcData}
                    />
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
                        id="telephone-input"
                        type="text"
                        component={TextField}
                        fullWidth
                        data-cy="telephone"
                        required
                        disabled={!orcData}
                      />
                      <Field
                        name="telephone_alt"
                        label="Telephone Alt."
                        id="telephone-input-alt"
                        type="text"
                        component={TextField}
                        fullWidth
                        data-cy="telephone-alt"
                        disabled={!orcData}
                      />
                    </Grid>
                  </CardContent>
                </Card>
                <Field
                  name="privacy_agreement"
                  component={CheckboxWithLabel}
                  type="checkbox"
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
                  data-cy="privacy-agreement"
                  disabled={!orcData}
                />
                <Field
                  name="cookie_policy"
                  type="checkbox"
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
                  data-cy="cookie-policy"
                  disabled={!orcData}
                />

                <Button
                  type="submit"
                  fullWidth
                  className={classes.submit}
                  data-cy="submit"
                  disabled={
                    isSubmitting ||
                    !values.privacy_agreement ||
                    !values.cookie_policy
                  }
                >
                  {isSubmitting ? <UOLoader size={24} /> : 'Sign Up'}
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
};

SignUp.propTypes = SignUpPropTypes;

export default SignUp;
