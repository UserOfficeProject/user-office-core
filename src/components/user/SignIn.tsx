import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { signInValidationSchema } from '@user-office-software/duo-validation/lib/User';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React, { useContext, useState } from 'react';
import { useLocation } from 'react-router';
import { Link, Redirect } from 'react-router-dom';

import UOLoader from 'components/common/UOLoader';
import LoginHelpPage from 'components/pages/LoginHelpPage';
import { UserContext } from 'context/UserContextProvider';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';
import orcid from 'images/orcid.png';
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
    width: '100%',
  },
  errorMessage: {
    color: theme.palette.error.main,
  },
  loginAlternative: {
    'border-top': '1px solid #e1e5ed',
    position: 'relative',
    'text-align': 'center',
    'margin-top': '1.5em',
    'padding-top': '2em',
    'padding-bottom': '2em',
    width: '100%',
  },
  loginAlternativeOr: {
    position: 'absolute',
    left: '50%',
    top: '-11px',
    'margin-left': '-16px',
    display: 'inline-block',
    height: '22px',
    'font-size': '.8rem',
    width: '32px',
    'text-align': 'center',
    background: '#fff',
    color: '#c5c5c5',
    'margin-bottom': '10px',
  },
  orcButton: {
    background: '#a6ce39',
    color: 'white',
    '&:hover': {
      background: '#a6ce39',
    },
  },
  orcidIconMedium: {
    'border-right': '1px solid white',
    'margin-right': '4px',
    'padding-right': '6px',
  },
  signInContainer: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  footer: {
    'text-align': 'center',
    padding: theme.spacing(2),
  },
}));

export default function SignInSide() {
  const classes = useStyles();
  const [failedLogin, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { handleLogin, token, currentRole } = useContext(UserContext);
  const unauthorizedApi = useUnauthorizedApi();
  const location = useLocation();

  const requestToken = async (values: { email: string; password: string }) => {
    const { email, password } = values;

    const data = await unauthorizedApi().login({ email, password });

    if (data.login && !data.login.rejection) {
      handleLogin(data.login.token);
    } else {
      if (data.login.rejection) {
        setErrorMessage(data.login.rejection.reason);
        setFailed(true);
      }
    }
  };

  if (token && currentRole) {
    const authRedirect = new URLSearchParams(location.search).get(
      'authRedirect'
    );

    if (authRedirect) {
      return (
        <Redirect
          to={{
            pathname: '/shared-auth',
            search: location.search,
          }}
        />
      );
    }

    return <Redirect to="/" />;
  }

  return (
    <PhotoInSide>
      <div className={classes.signInContainer}>
        <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={async (values): Promise<void> => {
            await requestToken(values);
          }}
          validationSchema={signInValidationSchema}
        >
          {({ isSubmitting }) => (
            <Form className={classes.form}>
              <CssBaseline />
              <StyledFormWrapper margin={[8, 4]}>
                <Avatar className={classes.avatar}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Sign in
                </Typography>
                <Field
                  name="email"
                  label="Email"
                  id="email-input"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="input-email"
                  disabled={isSubmitting}
                />
                <Field
                  name="password"
                  label="Password"
                  id="Password-input"
                  type="password"
                  component={TextField}
                  fullWidth
                  data-cy="input-password"
                  disabled={isSubmitting}
                />
                {failedLogin && (
                  <p className={classes.errorMessage}>{errorMessage}</p>
                )}
                <Button
                  type="submit"
                  fullWidth
                  className={classes.submit}
                  data-cy="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <UOLoader size={24} /> : 'Sign In'}
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link to="/ResetPasswordEmail">Forgot password?</Link>
                  </Grid>
                  <Grid item>
                    <Link to="/SignUp" data-cy="create-account">
                      Don&apos;t have an account? Sign Up
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <div className={classes.loginAlternative}>
                      <span className={classes.loginAlternativeOr}>or</span>
                      <Button
                        className={classes.orcButton}
                        variant="text"
                        onClick={() =>
                          (window.location.href = process.env
                            .REACT_APP_ORCID_REDIRECT as string)
                        }
                      >
                        <img
                          className={classes.orcidIconMedium}
                          src={orcid}
                          alt="ORCID iD icon"
                        />
                        Sign in with <b>&nbsp;ORCID</b>
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </StyledFormWrapper>
            </Form>
          )}
        </Formik>
        <div className={classes.footer}>
          <ButtonWithDialog label="Problems signing in?">
            <LoginHelpPage />
          </ButtonWithDialog>
        </div>
      </div>
    </PhotoInSide>
  );
}
