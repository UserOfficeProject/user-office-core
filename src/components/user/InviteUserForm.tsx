import { createUserByEmailInviteValidationSchema } from '@esss-swap/duo-validation/lib/User';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

import { UserRole } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

type InviteUserFormProps = {
  action: FunctionType;
  title: string;
  userRole: UserRole;
  close: FunctionType;
};

const InviteUserForm: React.FC<InviteUserFormProps> = ({
  action,
  title,
  userRole,
  close,
}) => {
  const { api } = useDataApiWithFeedback();
  const classes = makeStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    button: {
      marginTop: '25px',
      marginLeft: '10px',
    },
  })();

  return (
    <Formik
      initialValues={{
        firstname: '',
        lastname: '',
        email: '',
        userRole: userRole,
      }}
      onSubmit={async (values): Promise<void> => {
        const createResult = await api(
          'Invitation sent successfully!'
        ).createUserByEmailInvite({
          firstname: values.firstname,
          lastname: values.lastname,
          email: values.email,
          userRole: userRole,
        });
        action({
          firstname: values.firstname,
          lastname: values.lastname,
          organisation: '',
          id: createResult?.createUserByEmailInvite.id,
        });
        close();
      }}
      validationSchema={createUserByEmailInviteValidationSchema(UserRole)}
    >
      {() => (
        <Form>
          <Typography component="h1" variant="h5">
            {title}
          </Typography>
          <Field
            name="firstname"
            label="First name"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="firstname"
          />
          <Field
            name="lastname"
            label="Last name"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="lastname"
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

          <div className={classes.buttons}>
            <Button
              onClick={() => close()}
              variant="contained"
              color="secondary"
              className={classes.button}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
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
