import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { createUserByEmailInviteValidationSchema } from '@user-office-software/duo-validation/lib/User';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
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

const useStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const InviteUserForm: React.FC<InviteUserFormProps> = ({
  action,
  title,
  userRole,
  close,
}) => {
  const { api } = useDataApiWithFeedback();
  const classes = useStyles();

  return (
    <Formik
      initialValues={{
        firstname: '',
        lastname: '',
        email: '',
        userRole: userRole,
      }}
      onSubmit={async (values): Promise<void> => {
        const createResult = await api({
          toastSuccessMessage: 'Invitation sent successfully!',
        }).createUserByEmailInvite({
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          userRole: userRole,
        });
        if (createResult?.createUserByEmailInvite.id) {
          action({
            id: createResult.createUserByEmailInvite.id,
            firstname: values.firstname,
            lastname: values.lastname,
            organisation: '',
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

          <div className={classes.buttons}>
            <Button
              onClick={() => close()}
              color="secondary"
              className={classes.button}
            >
              Cancel
            </Button>
            <Button
              className={classes.button}
              type="submit"
              data-cy="invitation-submit"
            >
              {title}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default InviteUserForm;
