import { userPasswordFieldValidationSchema } from '@esss-swap/duo-validation/lib/User';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/styles/makeStyles';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
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
    return api('Updated Password').updatePassword({ id: props.id, password });
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
            <Typography variant="h6" gutterBottom>
              Password
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Field
                  name="password"
                  label="New Password"
                  type="password"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="new-password"
                  data-cy="password"
                  helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="new-password"
                  data-cy="confirmPassword"
                />
              </Grid>
            </Grid>
            <div className={classes.buttons}>
              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
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
