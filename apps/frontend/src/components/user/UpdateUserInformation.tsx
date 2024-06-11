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
import { Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import React, { useState, useContext } from 'react';

import Autocomplete from 'components/common/FormikUIAutocomplete';
import FormikUIDatePicker from 'components/common/FormikUIDatePicker';
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

  const initialValues = {
    username: userData?.username,
    firstname: userData?.firstname,
    middlename: userData?.middlename || '',
    lastname: userData?.lastname,
    preferredname: userData?.preferredname || '',
    gender:
      userData?.gender !== 'male' && userData?.gender !== 'female'
        ? 'other'
        : userData?.gender,
    othergender: userData?.gender,
    nationality: userData?.nationality,
    birthdate: DateTime.fromJSDate(new Date(userData?.birthdate)),
    institutionId: userData?.institutionId,
    department: userData?.department,
    position: userData?.position,
    oldEmail: userData?.email,
    email: userData?.email,
    telephone: userData?.telephone,
    telephone_alt: userData?.telephone_alt || '',
    user_title: userData?.user_title,
    oidcSub: userData?.oidcSub,
  };

  // NOTE: User should be older than 18 years.
  const userMaxBirthDate = DateTime.now().minus({ years: 18 });

  if (!userData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '50px' }} />;
  }

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
                <Select
                  name="user_title"
                  options={userTitleOptions}
                  inputLabel={{ htmlFor: 'user_title', required: true }}
                  label="Title"
                  data-cy="title"
                  required
                />
                <TextField
                  name="firstname"
                  label="Firstname"
                  id="firstname-input"
                  type="text"
                  data-cy="firstname"
                />
                <TextField
                  name="middlename"
                  label="Middle name"
                  id="middlename-input"
                  type="text"
                  data-cy="middlename"
                />
                <TextField
                  name="lastname"
                  label="Lastname"
                  id="lastname-input"
                  type="text"
                  data-cy="lastname"
                />
                <TextField
                  name="preferredname"
                  label="Preferred name"
                  id="preferredname-input"
                  type="text"
                  data-cy="preferredname"
                />
                <Select
                  name="gender"
                  options={genderOptions}
                  inputLabel={{ htmlFor: 'gender', required: true }}
                  label="Gender"
                  data-cy="gender"
                  required
                />
                {values.gender === 'other' && (
                  <TextField
                    name="othergender"
                    label="Please specify gender"
                    id="othergender-input"
                    type="text"
                    data-cy="othergender"
                  />
                )}
                <Autocomplete
                  name="nationality"
                  label="Nationality"
                  items={nationalitiesList}
                  data-cy="nationality"
                  required
                  loading={!nationalities}
                  noOptionsText="No nationalities"
                />

                <FormikUIDatePicker
                  name="birthdate"
                  label="Birthdate"
                  format={format || undefined}
                  data-cy="birthdate"
                  closeOnSelect
                  slotProps={{
                    textField: { fullWidth: true, name: 'birthdate' },
                  }}
                  maxDate={userMaxBirthDate}
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
              <TextField
                name="username"
                label="Username"
                id="username-input"
                type="text"
                autoComplete="off"
                data-cy="username"
                disabled
              />
              <Autocomplete
                name="institutionId"
                label="Institution"
                items={institutionsList}
                data-cy="institution"
                loading={loadingInstitutions}
                noOptionsText="No institutions"
              />
              {values.institutionId && +values.institutionId === 1 && (
                <>
                  <TextField
                    name="otherInstitution"
                    label="Please specify institution"
                    id="institution-input"
                    type="text"
                    margin="normal"
                    data-cy="otherInstitution"
                    required
                  />
                </>
              )}
              <TextField
                name="department"
                label="Department"
                id="department-input"
                type="text"
                data-cy="department"
                required
              />
              <TextField
                name="position"
                label="Position"
                id="position-input"
                type="text"
                data-cy="position"
                required
              />
              <TextField
                name="email"
                label="E-mail"
                id="email-input"
                type="email"
                data-cy="email"
              />
              <TextField
                name="telephone"
                label="Telephone"
                id="telephone-input"
                type="text"
                data-cy="telephone"
                required
              />
              <TextField
                name="telephone_alt"
                label="Telephone Alt."
                id="telephone-alt-input"
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
