import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { signInValidationSchema } from '@esss-swap/duo-validation';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useContext, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';

import { UserContext } from '../../context/UserContextProvider';
import { useUnauthorizedApi } from '../../hooks/useDataApi';
import orcid from '../../images/orcid.png';
import { FormWrapper } from '../../styles/StyledComponents';
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
}));

export default function SignInSide() {
  const classes = useStyles();
  const [failedLogin, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { handleLogin, token } = useContext(UserContext);
  const unauthorizedApi = useUnauthorizedApi();

  const requestToken = (values: { email: string; password: string }) => {
    const { email, password } = values;

    unauthorizedApi.login({ email, password }).then(data => {
      if (data.login && !data.login.error) {
        handleLogin(data.login.token);
      } else {
        if (data.login) {
          setErrorMessage(getTranslation(data.login.error as ResourceId));
          setFailed(true);
        }
      }
    });
  };

  if (token) {
    return <Redirect to="/" />;
  }

  return (
    <PhotoInSide>
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={async (values, actions) => {
          await requestToken(values);
          actions.setSubmitting(false);
        }}
        validationSchema={signInValidationSchema}
      >
        <Form className={classes.form}>
          <CssBaseline />
          <FormWrapper margin={[8, 4]}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Field
              name="email"
              label="Email"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="input-email"
            />
            <Field
              name="password"
              label="Password"
              type="password"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="input-password"
            />
            {failedLogin && (
              <p className={classes.errorMessage}>{errorMessage}</p>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              data-cy="submit"
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="/ResetPasswordEmail/">Forgot password?</Link>
              </Grid>
              <Grid item>
                <Link to="/SignUp/" data-cy="create-account">
                  Don&apos;t have an account? Sign Up
                </Link>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.loginAlternative}>
                  <span className={classes.loginAlternativeOr}>or</span>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.orcButton}
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
          </FormWrapper>
        </Form>
      </Formik>
    </PhotoInSide>
  );
}
