import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { userPasswordFieldValidationSchema } from '@user-office-software/duo-validation/lib/User';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useUnauthorizedApi } from 'hooks/common/useDataApi';
import { StyledFormWrapper } from 'styles/StyledComponents';

import PhotoInSide from './PhotoInSide';

const useStyles = makeStyles((theme) => ({
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
      .then((data) =>
        data.resetPassword.rejection
          ? setErrorMessage(true)
          : setPasswordReset(true)
      );
  };

  return (
    <PhotoInSide>
      <Formik
        initialValues={{ password: '' }}
        onSubmit={async (values): Promise<void> => {
          await requestResetPassword(values);
        }}
        validationSchema={userPasswordFieldValidationSchema}
      >
        <Form className={classes.form}>
          <CssBaseline />
          <StyledFormWrapper margin={[8, 4]}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Set Password
            </Typography>
            <Field
              name="password"
              label="Password"
              id="password-input"
              type="password"
              component={TextField}
              helperText="Password must contain at least 8 characters (including upper case, lower case and numbers)"
              autoComplete="new-password"
              fullWidth
            />
            <Field
              name="confirmPassword"
              label="Confirm Password"
              id="confirm-password-input"
              type="password"
              component={TextField}
              autoComplete="new-password"
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
            <Button type="submit" fullWidth className={classes.submit}>
              Set password
            </Button>
            <Grid container>
              <Grid item>
                <Link to="/SignIn/">Back to Sign In? Sign In</Link>
              </Grid>
            </Grid>
          </StyledFormWrapper>
        </Form>
      </Formik>
    </PhotoInSide>
  );
};

ResetPassword.propTypes = ResetPasswordPropTypes;

export default ResetPassword;
