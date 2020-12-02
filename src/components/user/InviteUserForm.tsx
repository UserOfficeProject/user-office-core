import { createUserByEmailInviteValidationSchema } from '@esss-swap/duo-validation/lib/User';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

import { UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function InviteUserForm(props: {
  action: Function;
  title: string;
  userRole: UserRole;
  close: Function;
}) {
  const api = useDataApi();
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
        name: '',
        lastname: '',
        email: '',
      }}
      onSubmit={async values => {
        const createResult = await api().createUserByEmailInvite({
          firstname: values.name,
          lastname: values.lastname,
          email: values.email,
          userRole: props.userRole,
        });
        props.action({
          firstname: values.name,
          lastname: values.lastname,
          organisation: '',
          id: createResult?.createUserByEmailInvite.id,
        });
        props.close();
      }}
      validationSchema={createUserByEmailInviteValidationSchema(UserRole)}
    >
      {subformik => (
        <Form>
          <Typography component="h1" variant="h5">
            {props.title}
          </Typography>
          <Field
            name="name"
            label="Name"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
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
              onClick={() => props.close()}
              variant="contained"
              color="secondary"
              className={classes.button}
            >
              Cancel
            </Button>
            <Button
              onClick={() => subformik.submitForm()}
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Invite User
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
