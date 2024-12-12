import { Box, Button, Typography } from '@mui/material';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import Select from 'components/common/FormikUISelect';
import TextField from 'components/common/FormikUITextField';
import UOLoader from 'components/common/UOLoader';
import { useRolesData } from 'hooks/user/useRolesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

type InviteUserFormProps = {
  close: FunctionType;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validationSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .matches(emailRegex, 'Invalid email format'),
  roles: Yup.array().min(1, 'At least one role must be selected'),
});

interface FormValues {
  email: string;
  note: string;
  roles: number[];
}

const initialValues: FormValues = {
  email: '',
  note: '',
  roles: [],
};

const InviteByEmailForm = ({ close }: InviteUserFormProps) => {
  const { api } = useDataApiWithFeedback();
  const { rolesData } = useRolesData();

  const handleSubmit = (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    api().createInvite({
      input: {
        email: values.email,
        note: values.note,
        claims: {
          roleIds: values.roles,
        },
      },
    });
    actions.setSubmitting(false);
    close();
  };

  if (rolesData === null) {
    return <UOLoader />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ isSubmitting, touched, errors }) => (
        <Form>
          <Typography variant="h5" component="h2" gutterBottom>
            Invite user
          </Typography>

          {/* Email Field */}
          <Field
            id="email"
            name="email"
            label="Email"
            type="text"
            component={TextField}
            fullWidth
            data-cy="email"
          />

          <Field
            name="roles"
            options={rolesData.map((role) => ({
              value: role.id,
              text: role.title,
            }))}
            multiple
            component={Select}
            inputLabel={{ htmlFor: 'roles', required: true }}
            label="Roles"
            data-cy="roles"
            formControl={{ margin: 'normal' }}
            disabled={isSubmitting}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email && errors.email}
          />

          <Field
            id="note"
            name="note"
            label="Note"
            type="text"
            component={TextField}
            fullWidth
            multiline
            rows={4}
            data-cy="note"
          />

          {/* Submit and Cancel Buttons */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              onClick={() => close()}
              color="secondary"
              sx={{ marginTop: '25px', marginLeft: '10px' }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              sx={{ marginTop: '25px', marginLeft: '10px' }}
              type="submit"
              data-cy="invitation-submit"
              disabled={isSubmitting}
            >
              Send Invite
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default InviteByEmailForm;
