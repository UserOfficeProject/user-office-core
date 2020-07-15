import { userPasswordFieldValidationSchema } from '@esss-swap/duo-validation';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import React from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

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
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const sendPasswordUpdate = (password: string) => {
    api()
      .updatePassword({ id: props.id, password })
      .then(data =>
        enqueueSnackbar('Updated Password', {
          variant: data.updatePassword.error ? 'error' : 'success',
        })
      );
  };

  const classes = useStyles();

  return (
    <React.Fragment>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
        }}
        onSubmit={(values, actions) => {
          sendPasswordUpdate(values.password);
          actions.setSubmitting(false);
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
                  autoComplete="off"
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
                  autoComplete="off"
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
