import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { updateUserValidationSchema } from '@user-office-software/duo-validation';
import { Field, Form, Formik } from 'formik';
import React, { useState, useContext } from 'react';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import ImpersonateButton from 'components/common/ImpersonateButton';
import UOLoader from 'components/common/UOLoader';
import { UserContext } from 'context/UserContextProvider';
import { UpdateUserMutationVariables } from 'generated/sdk';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { useCountries } from 'hooks/user/useCountries';
import { useUserData } from 'hooks/user/useUserData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { Option } from 'utils/utilTypes';

interface UpdateUserInformationProps {
  id: number;
}
export default function UpdateUserInformation(
  props: UpdateUserInformationProps
) {
  const { user } = useContext(UserContext);
  const { userData } = useUserData({ userId: props.id });

  const { api } = useDataApiWithFeedback();
  const countries = useCountries();
  const { institutions, loadingInstitutions } = useInstitutionsData();
  const [institutionsList, setInstitutionsList] = useState<Option[]>([]);
  const [countriesList, setCountriesList] = useState<Option[]>([]);

  if (!userData) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '50px' }} />;
  }

  const initialValues = {
    firstname: userData.firstname,
    lastname: userData.lastname,
    preferredname: userData.preferredname || '',
    institutionId: userData.institutionId,
    oldEmail: userData.email,
    email: userData.email,
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

  if (!institutionsList.length && institutions.length) {
    setInstitutionsList(
      institutions.map((institution) => {
        return { text: institution.name, value: institution.id };
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
          institutionId: values.institutionId ? +values.institutionId : null,
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
                {/* Remove gender and birthdate fields */}
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <Field
                name="oidcSub"
                label="OIDC Subject"
                id="oidcSub-input"
                component={TextField}
                type="text"
                data-cy="oidcSub"
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
                name="email"
                label="E-mail"
                id="email-input"
                component={TextField}
                type="email"
                data-cy="email"
              />
              {/* Remove telephone field */}
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
                data-cy="impersonate-user-button"
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
