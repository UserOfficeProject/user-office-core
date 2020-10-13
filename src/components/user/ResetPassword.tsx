import { userPasswordFieldValidationSchema } from '@esss-swap/duo-validation/lib/User';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useUnauthorizedApi } from 'hooks/common/useDataApi';
import { FormWrapper } from 'styles/StyledComponents';

import PhotoInSide from './PhotoInSide';

const useStyles = makeStyles(theme => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  sentMessage: {
    color: theme.palette.secondary.main,
  },
  errorMessage: {
    color: theme.palette.error.main,
  },
}));

const ResetPasswordPropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type ResetPasswordProps = PropTypes.InferProps<typeof ResetPasswordPropTypes>;

const ResetPassword: React.FC<ResetPasswordProps> = ({ match }) => {
  const classes = useStyles();
  const [passwordReset, setPasswordReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const unauthorizedApi = useUnauthorizedApi();

  const requestResetPassword = async (values: { password: string }) => {
    const { password } = values;

    await unauthorizedApi()
      .resetPassword({
        token: match.params.token,
        password,
      })
      .then(data =>
        data.resetPassword.error
          ? setErrorMessage(true)
          : setPasswordReset(true)
      );
  };

  return (
    <PhotoInSide>
      <Formik
        initialValues={{ password: '' }}
        onSubmit={async (values, actions) => {
          await requestResetPassword(values);
          actions.setSubmitting(false);
        }}
        validationSchema={userPasswordFieldValidationSchema}
      >
        <Form className={classes.form}>
          <CssBaseline />
          <FormWrapper margin={[8, 4]}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Set Password
            </Typography>
            <Field
              name="password"
              label="Password"
              type="password"
              component={TextField}
              margin="normal"
              helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
              fullWidth
            />
            <Field
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              component={TextField}
              margin="normal"
              fullWidth
            />
            {passwordReset && (
              <p className={classes.sentMessage}>
                Your password has been changed
              </p>
            )}
            {errorMessage && (
              <p className={classes.errorMessage}>
                This link has expired, please reset password again
              </p>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Set password
            </Button>
            <Grid container>
              <Grid item>
                <Link to="/SignIn/">Back to Sign In? Sign In</Link>
              </Grid>
            </Grid>
          </FormWrapper>
        </Form>
      </Formik>
    </PhotoInSide>
  );
};

ResetPassword.propTypes = ResetPasswordPropTypes;

export default ResetPassword;
