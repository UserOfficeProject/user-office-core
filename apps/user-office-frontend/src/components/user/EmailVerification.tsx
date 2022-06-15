import Email from '@mui/icons-material/Email';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useDataApi } from 'hooks/common/useDataApi';
import { StyledFormWrapper } from 'styles/StyledComponents';

import PhotoInSide from './PhotoInSide';

const useStyles = makeStyles((theme) => ({
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.dark,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  signLink: {
    textDecoration: 'none',
  },
}));

const EmailVerificationPropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type EmailVerificationProps = PropTypes.InferProps<
  typeof EmailVerificationPropTypes
>;

const EmailVerification: React.FC<EmailVerificationProps> = ({ match }) => {
  const classes = useStyles();
  const [emailVerified, setEmailVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const api = useDataApi();

  if (!emailVerified) {
    api()
      .verifyEmail({ token: match.params.token })
      .then((data) =>
        data.emailVerification.success
          ? setEmailVerified(true)
          : setErrorMessage(true)
      );
  }

  return (
    <PhotoInSide>
      <StyledFormWrapper>
        <Avatar className={classes.avatar}>
          <Email />
        </Avatar>
        <Typography component="h1" variant="h5">
          {emailVerified && 'Email Verified'}
          {errorMessage && 'Email Verfication Failed'}
        </Typography>
        {emailVerified && (
          <Link to="/SignIn/" className={classes.signLink}>
            <Button type="submit" fullWidth className={classes.submit}>
              click here to sign in
            </Button>
          </Link>
        )}
        {errorMessage && (
          <p>
            Something went wrong, please contact user office at
            useroffice@esss.se
          </p>
        )}
      </StyledFormWrapper>
    </PhotoInSide>
  );
};

EmailVerification.propTypes = EmailVerificationPropTypes;

export default EmailVerification;
