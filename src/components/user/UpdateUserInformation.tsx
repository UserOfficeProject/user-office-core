import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import DoneIcon from '@mui/icons-material/Done';
import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { updateUserValidationSchema } from '@user-office-software/duo-validation';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { DatePicker } from 'formik-mui-lab';
import { DateTime } from 'luxon';
import React, { useState, useContext } from 'react';

import FormikDropdown, { Option } from 'components/common/FormikDropdown';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { UpdateUserMutationVariables, UserRole } from 'generated/sdk';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { useGetFields } from 'hooks/user/useGetFields';
import { useUserData } from 'hooks/user/useUserData';
import orcid from 'images/orcid.png';
import { StyledButtonContainer } from 'styles/StyledComponents';
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
  const { currentRole } = useContext(UserContext);
  const { userData, setUserData } = useUserData(props);
  const { api } = useDataApiWithFeedback();
  const fieldsContent = useGetFields();
  const { institutions, loadingInstitutions } = useInstitutionsData();
  const [nationalitiesList, setNationalitiesList] = useState<Option[]>([]);
  const [institutionsList, setInstitutionsList] = useState<Option[]>([]);
  const classes = useStyles();

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
      setUserEmailVerified: { rejection },
    } = await api('Email verified').setUserEmailVerified({ id: props.id });

    if (!rejection) {
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
      setUserNotPlaceholder: { rejection },
    } = await api('User is no longer placeholder').setUserNotPlaceholder({
      id: props.id,
    });

    if (!rejection) {
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
          birthdate: DateTime.fromMillis(parseInt(userData.birthdate)).toFormat(
            'yyyy-MM-dd'
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
            <Typography variant="h6" component="h2" gutterBottom>
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
                <LocalizationProvider dateAdapter={DateAdapter}>
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
                    id="firstname-input"
                    type="text"
                    component={TextField}
                    fullWidth
                    data-cy="firstname"
                  />
                  <Field
                    name="middlename"
                    label="Middle name"
                    id="middlename-input"
                    type="text"
                    component={TextField}
                    fullWidth
                    data-cy="middlename"
                  />
                  <Field
                    name="lastname"
                    label="Lastname"
                    id="lastname-input"
                    type="text"
                    component={TextField}
                    fullWidth
                    data-cy="lastname"
                  />
                  <Field
                    name="preferredname"
                    label="Preferred name"
                    id="preferredname-input"
                    type="text"
                    component={TextField}
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
                      id="othergender-input"
                      type="text"
                      component={TextField}
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
                    id="birthdate-input"
                    inputFormat="yyyy-MM-dd"
                    component={DatePicker}
                    textField={{
                      fullWidth: true,
                      'data-cy': 'birthdate',
                    }}
                  />
                </LocalizationProvider>
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
                  id="username-input"
                  type="text"
                  component={TextField}
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
                  id="department-input"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="department"
                />
                <Field
                  name="position"
                  label="Position"
                  id="position-input"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="position"
                />
                <Field
                  name="email"
                  label="E-mail"
                  id="email-input"
                  type="email"
                  component={TextField}
                  fullWidth
                  data-cy="email"
                />
                <Field
                  name="telephone"
                  label="Telephone"
                  id="telephone-input"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="telephone"
                />
                <Field
                  name="telephone_alt"
                  label="Telephone Alt."
                  id="telephone-alt-input"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="telephone-alt"
                />
              </Grid>
            </Grid>
            <StyledButtonContainer>
              <Button
                disabled={isSubmitting}
                type="submit"
                className={classes.button}
              >
                Update Profile
              </Button>
            </StyledButtonContainer>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
}
