import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { userPasswordFieldValidationSchema } from '@user-office-software/duo-validation/lib/User';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';

import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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

export default function UpdatePassword(props: { id: number }) {
  const { api } = useDataApiWithFeedback();
  const sendPasswordUpdate = (password: string) => {
    return api({ toastSuccessMessage: 'Updated Password' }).updatePassword({
      id: props.id,
      password,
    });
  };

  const classes = useStyles();

  return (
    <React.Fragment>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
        }}
        onSubmit={async (values): Promise<void> => {
          await sendPasswordUpdate(values.password);
        }}
        validationSchema={userPasswordFieldValidationSchema}
      >
        {({ isSubmitting }) => (
          <Form>
            <Typography variant="h6" component="h2" gutterBottom>
              Password
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Field
                  name="password"
                  label="New Password"
                  id="password-input"
                  type="password"
                  component={TextField}
                  fullWidth
                  required
                  autoComplete="new-password"
                  data-cy="password"
                  helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  name="confirmPassword"
                  label="Confirm Password"
                  id="confirm-password-input"
                  type="password"
                  component={TextField}
                  fullWidth
                  required
                  autoComplete="new-password"
                  data-cy="confirmPassword"
                />
              </Grid>
            </Grid>
            <div className={classes.buttons}>
              <Button
                disabled={isSubmitting}
                type="submit"
                className={classes.button}
              >
                Change Password
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
}
