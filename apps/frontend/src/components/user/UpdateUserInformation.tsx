import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { updateUserValidationSchema } from '@user-office-software/duo-validation';
import { Field, Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import React, { useState, useContext } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import DatePicker from 'components/common/FormikUIDatePicker';
import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import ImpersonateButton from 'components/common/ImpersonateButton';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId, UpdateUserMutationVariables } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { useCountries } from 'hooks/user/useCountries';
import { useNationalities } from 'hooks/user/useNationalities';
import { useUserData } from 'hooks/user/useUserData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { Option } from 'utils/utilTypes';

interface UpdateUserInformationProps {
  id: number;
}
export default function UpdateUserInformation(
  props: UpdateUserInformationProps
) {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const { userData } = useUserData({ userId: props.id });
  const { format } = useFormattedDateTime({
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });
  const { api } = useDataApiWithFeedback();
  const nationalities = useNationalities();
  const countries = useCountries();
  const { institutions, loadingInstitutions } = useInstitutionsData();
  const [nationalitiesList, setNationalitiesList] = useState<Option[]>([]);
  const [institutionsList, setInstitutionsList] = useState<Option[]>([]);
  const [countriesList, setCountriesList] = useState<Option[]>([]);

  // NOTE: User should be older than 18 years.
  const userMaxBirthDate = DateTime.now().minus({ years: 18 });

  if (!userData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '50px' }} />;
  }

  const initialValues = {
    username: userData.username,
    firstname: userData.firstname,
    middlename: userData.middlename || '',
    lastname: userData.lastname,
    preferredname: userData.preferredname || '',
    gender:
      userData.gender !== 'male' && userData.gender !== 'female'
        ? 'other'
        : userData.gender,
    othergender: userData.gender,
    nationality: userData.nationality,
    birthdate: DateTime.fromJSDate(new Date(userData.birthdate)),
    institutionId: userData.institutionId,
    department: userData.department,
    position: userData.position,
    oldEmail: userData.email,
    email: userData.email,
    telephone: userData.telephone,
    telephone_alt: userData.telephone_alt || '',
    user_title: userData.user_title,
    oidcSub: userData.oidcSub,
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

  if (!institutionsList.length && institutions.length) {
    setInstitutionsList(
      institutions.map((institution) => {
        return { text: institution.name, value: institution.id };
      })
    );
  }

  if (!nationalitiesList.length && nationalities) {
    setNationalitiesList(
      nationalities.map((nationality) => {
        return { text: nationality.value, value: nationality.id };
      })
    );
  }

  if (!countriesList.length && countries) {
    setCountriesList(
      countries.map((country) => {
        return { text: country.value, value: country.id };
      })
    );
  }

  const sendUserUpdate = (variables: UpdateUserMutationVariables) => {
    return api({ toastSuccessMessage: 'Updated Information' }).updateUser(
      variables
    );
  };

  return (
    <Formik
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={async (values, actions): Promise<void> => {
        const newValues = {
          id: props.id,
          ...values,
          nationality: +(values.nationality as number),
          institutionId: values.institutionId ? +values.institutionId : null,
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
            <Box
              sx={{
                '& > * + *': {
                  margin: theme.spacing(0.5),
                },
              }}
            >
              {userData.placeholder && (
                <Chip
                  color="primary"
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
                <Field
                  name="user_title"
                  options={userTitleOptions}
                  component={Select}
                  inputLabel={{ htmlFor: 'user_title', required: true }}
                  label="Title"
                  data-cy="title"
                  required
                />
                <Field
                  name="firstname"
                  label="Firstname"
                  id="firstname-input"
                  component={TextField}
                  type="text"
                  data-cy="firstname"
                />
                <Field
                  name="middlename"
                  label="Middle name"
                  id="middlename-input"
                  component={TextField}
                  type="text"
                  data-cy="middlename"
                />
                <Field
                  name="lastname"
                  label="Lastname"
                  id="lastname-input"
                  component={TextField}
                  type="text"
                  data-cy="lastname"
                />
                <Field
                  name="preferredname"
                  label="Preferred name"
                  id="preferredname-input"
                  component={TextField}
                  type="text"
                  data-cy="preferredname"
                />
                <Field
                  name="gender"
                  component={Select}
                  options={genderOptions}
                  inputLabel={{ htmlFor: 'gender', required: true }}
                  label="Gender"
                  data-cy="gender"
                  required
                />
                {values.gender === 'other' && (
                  <Field
                    name="othergender"
                    label="Please specify gender"
                    id="othergender-input"
                    component={TextField}
                    type="text"
                    data-cy="othergender"
                  />
                )}
                <FormikUIAutocomplete
                  name="nationality"
                  label="Nationality"
                  items={nationalitiesList}
                  data-cy="nationality"
                  required
                  loading={!nationalities}
                  noOptionsText="No nationalities"
                />
                <Field
                  name="birthdate"
                  label="Birthdate"
                  id="birthdate-input"
                  inputFormat={format}
                  inputProps={{ placeholder: format }}
                  component={DatePicker}
                  textField={{
                    fullWidth: true,
                    'data-cy': 'birthdate',
                  }}
                  maxDate={userMaxBirthDate}
                  desktopModeMediaQuery={theme.breakpoints.up('sm')}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel shrink>
                  ORCID iD{' '}
                  <Box
                    component="img"
                    sx={{
                      verticalAlign: 'middle',
                      marginLeft: theme.spacing(0.5),
                      width: '16px',
                      height: '16px',
                      border: '0px',
                    }}
                    src="/images/orcid.png"
                    alt="ORCID iD icon"
                  />
                </InputLabel>
                <Link
                  href={'https://orcid.org/' + values.oidcSub}
                  target="_blank"
                  rel="noreferrer noopener"
                  sx={{ marginTop: theme.spacing(3) }}
                >
                  https://orcid.org/{values.oidcSub}
                </Link>
              </FormControl>
              <Field
                name="username"
                label="Username"
                id="username-input"
                component={TextField}
                type="text"
                autoComplete="off"
                data-cy="username"
                disabled
              />
              <FormikUIAutocomplete
                name="institutionId"
                label="Institution"
                items={institutionsList}
                data-cy="institution"
                loading={loadingInstitutions}
                noOptionsText="No institutions"
              />
              {values.institutionId && +values.institutionId === 1 && (
                <>
                  <Field
                    name="otherInstitution"
                    label="Please specify institution"
                    id="institution-input"
                    component={TextField}
                    type="text"
                    margin="normal"
                    data-cy="otherInstitution"
                    required
                  />
                </>
              )}
              <Field
                name="department"
                label="Department"
                id="department-input"
                component={TextField}
                type="text"
                data-cy="department"
                required
              />
              <Field
                name="position"
                label="Position"
                id="position-input"
                component={TextField}
                type="text"
                data-cy="position"
                required
              />
              <Field
                name="email"
                label="E-mail"
                id="email-input"
                component={TextField}
                type="email"
                data-cy="email"
              />
              <Field
                name="telephone"
                label="Telephone"
                id="telephone-input"
                component={TextField}
                type="text"
                data-cy="telephone"
                required
              />
              <Field
                name="telephone_alt"
                label="Telephone Alt."
                id="telephone-alt-input"
                component={TextField}
                type="text"
                data-cy="telephone-alt"
              />
            </Grid>
          </Grid>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            marginTop={2}
          >
            {props.id !== user.id && (
              <ImpersonateButton
                userId={props.id}
                startIcon={<SwitchAccountOutlinedIcon />}
              >
                Connect as this user...
              </ImpersonateButton>
            )}
            <Button disabled={isSubmitting} type="submit">
              Update Profile
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}
