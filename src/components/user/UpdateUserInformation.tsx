import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import { updateUserValidationSchema } from '@esss-swap/duo-validation';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import DoneIcon from '@material-ui/icons/Done';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import dateformat from 'dateformat';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';
import React, { useEffect, useState, useContext } from 'react';

import FormikDropdown, { Option } from 'components/common/FormikDropdown';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { UpdateUserMutationVariables, User, UserRole } from 'generated/sdk';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { useGetFields } from 'hooks/user/useGetFields';
import orcid from 'images/orcid.png';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
  orcIdLabel: {
    marginBottom: theme.spacing(1),
  },
  orcidIconSmall: {
    verticalAlign: 'middle',
    marginLeft: theme.spacing(0.5),
    width: '16px',
    height: '16px',
    border: '0px',
  },
  orcIdContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    overflow: 'hidden',
  },
  chipSpace: {
    '& > * + *': {
      margin: theme.spacing(0.5),
    },
  },
}));

export default function UpdateUserInformation(props: { id: number }) {
  const { user, currentRole } = useContext(UserContext);
  const [userData, setUserData] = useState<User | null>(null);
  const { api } = useDataApiWithFeedback();
  const fieldsContent = useGetFields();
  const { institutions, loadingInstitutions } = useInstitutionsData();
  const [nationalitiesList, setNationalitiesList] = useState<Option[]>([]);
  const [institutionsList, setInstitutionsList] = useState<Option[]>([]);
  const classes = useStyles();

  useEffect(() => {
    const getUserInformation = (id: number) => {
      if (user.id !== props.id) {
        api()
          .getUser({ id })
          .then((data) => {
            setUserData({ ...(data.user as User) });
          });
      } else {
        api()
          .getUserMe()
          .then((data) => {
            setUserData({ ...(data.me as User) });
          });
      }
    };
    getUserInformation(props.id);
  }, [props.id, user.id, api]);

  if (loadingInstitutions || !fieldsContent || !userData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '50px' }} />;
  }

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

  const sendUserUpdate = (variables: UpdateUserMutationVariables) => {
    return api('Updated Information').updateUser(variables);
  };

  const isUserOfficer = currentRole === UserRole.USER_OFFICER;

  const handleSetUserEmailVerified = async () => {
    const {
      setUserEmailVerified: { error },
    } = await api('Email verified').setUserEmailVerified({ id: props.id });

    if (!error) {
      setUserData((userData) =>
        userData
          ? {
              ...userData,
              emailVerified: true,
            }
          : null
      );
    }
  };

  const handleSetUserNotPlaceholder = async () => {
    const {
      setUserNotPlaceholder: { error },
    } = await api('User is no longer placeholder').setUserNotPlaceholder({
      id: props.id,
    });

    if (!error) {
      setUserData((userData) =>
        userData
          ? {
              ...userData,
              placeholder: false,
            }
          : null
      );
    }
  };

  return (
    <React.Fragment>
      <Formik
        validateOnChange={false}
        initialValues={{
          username: userData.username,
          firstname: userData.firstname,
          middlename: userData.middlename,
          lastname: userData.lastname,
          preferredname: userData.preferredname,
          gender:
            userData.gender !== 'male' && userData.gender !== 'female'
              ? 'other'
              : userData.gender,
          othergender: userData.gender,
          nationality: userData.nationality,
          birthdate: dateformat(
            new Date(parseInt(userData.birthdate)),
            'yyyy-mm-dd'
          ),
          organisation: userData.organisation,
          department: userData.department,
          position: userData.position,
          oldEmail: userData.email,
          email: userData.email,
          telephone: userData.telephone,
          telephone_alt: userData.telephone_alt,
          user_title: userData.user_title,
          orcid: userData.orcid,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          const newValues = {
            id: props.id,
            ...values,
            nationality: +(values.nationality as number),
            organisation: +values.organisation,
            gender:
              values.gender === 'other' ? values.othergender : values.gender,
          } as UpdateUserMutationVariables;

          await sendUserUpdate({
            ...newValues,
          });
          actions.setFieldValue('oldEmail', values.email);
        }}
        validationSchema={updateUserValidationSchema}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <Typography variant="h6" gutterBottom>
              User Information
              <Box className={classes.chipSpace}>
                {!userData.emailVerified && (
                  <Chip
                    color="primary"
                    deleteIcon={<DoneIcon data-cy="btn-verify-email" />}
                    onDelete={
                      isUserOfficer ? handleSetUserEmailVerified : undefined
                    }
                    icon={<AlternateEmailIcon />}
                    size="small"
                    label="Email not verified"
                  />
                )}
                {userData.placeholder && (
                  <Chip
                    color="primary"
                    deleteIcon={
                      <DoneIcon data-cy="btn-set-user-not-placeholder" />
                    }
                    onDelete={
                      isUserOfficer ? handleSetUserNotPlaceholder : undefined
                    }
                    icon={<AccountCircleIcon />}
                    size="small"
                    label="Placeholder user"
                  />
                )}
              </Box>
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <>
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
                        { text: 'Female', value: 'female' },
                        { text: 'Male', value: 'male' },
                        { text: 'Other', value: 'other' },
                      ]}
                      data-cy="gender"
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
                      />
                    )}
                    <FormikDropdown
                      name="nationality"
                      label="Nationality"
                      items={nationalitiesList}
                      data-cy="nationality"
                    />

                    <Field
                      name="birthdate"
                      label="Birthdate"
                      format="yyyy-MM-dd"
                      component={KeyboardDatePicker}
                      margin="normal"
                      fullWidth
                      data-cy="birthdate"
                    />
                  </>
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={6}>
                <div className={classes.orcIdContainer}>
                  <InputLabel shrink className={classes.orcIdLabel}>
                    ORCID iD{' '}
                    <img
                      className={classes.orcidIconSmall}
                      src={orcid}
                      alt="ORCID iD icon"
                    />
                  </InputLabel>
                  <a
                    href={'https://orcid.org/' + values.orcid}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    https://orcid.org/{values.orcid}
                  </a>
                </div>
                <Field
                  name="username"
                  label="Username"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="username"
                  disabled={true}
                />
                <FormikDropdown
                  name="organisation"
                  label="Organisation"
                  items={institutionsList}
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
                  name="position"
                  label="Position"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  data-cy="position"
                />
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
            </Grid>
            <ButtonContainer>
              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Update Profile
              </Button>
            </ButtonContainer>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
}
