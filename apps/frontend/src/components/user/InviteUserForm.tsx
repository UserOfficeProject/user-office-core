import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createUserByEmailInviteValidationSchema } from '@user-office-software/duo-validation/lib/User';
import { Field, Form, Formik } from 'formik';
import React from 'react';

import { BasicUserDetails, UserRole } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

type InviteUserFormProps = {
  action: FunctionType<void, [BasicUserDetails]>;
  title: string;
  userRole: UserRole;
  close: FunctionType;
};

const InviteUserForm = ({
  action,
  title,
  userRole,
  close,
}: InviteUserFormProps) => {
  const { api } = useDataApiWithFeedback();

  return (
    <Formik
      initialValues={{
        firstname: '',
        lastname: '',
        email: '',
        userRole: userRole,
      }}
      onSubmit={async (values): Promise<void> => {
        const { createUserByEmailInvite: createdUserId } = await api({
          toastSuccessMessage: 'Invitation sent successfully!',
        }).createUserByEmailInvite({
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          userRole: userRole,
        });
        if (createdUserId) {
          action({
            id: createdUserId,
            firstname: values.firstname,
            lastname: values.lastname,
            institution: '',
          } as BasicUserDetails);
          close();
        }
      }}
      validationSchema={createUserByEmailInviteValidationSchema(UserRole)}
    >
      {() => (
        <Form>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          <Field
            id="firstname-input"
            name="firstname"
            label="First name"
            type="text"
            component={TextField}
            fullWidth
            data-cy="firstname"
          />
          <Field
            id="lastname-input"
            name="lastname"
            label="Last name"
            type="text"
            component={TextField}
            fullWidth
            data-cy="lastname"
          />
          <Field
            id="email-input"
            name="email"
            label="E-mail"
            type="email"
            component={TextField}
            fullWidth
            data-cy="email"
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => close()}
              color="secondary"
              sx={{ marginTop: '25px', marginLeft: '10px' }}
            >
              Cancel
            </Button>
            <Button
              sx={{ marginTop: '25px', marginLeft: '10px' }}
              type="submit"
              data-cy="invitation-submit"
            >
              {title}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default InviteUserForm;
