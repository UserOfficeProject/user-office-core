import PropTypes from 'prop-types';
import React, { ReactElement, useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';

const ExternalAuthPropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      sessionId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type ExternalAuthProps = PropTypes.InferProps<typeof ExternalAuthPropTypes>;

const ExternalAuth: React.FC<ExternalAuthProps> = ({ match }) => {
  const { handleLogin } = useContext(UserContext);
  const unauthorizedApi = useUnauthorizedApi();
  const sessionId: string = match.params.sessionId;

  const data = unauthorizedApi().checkExternalToken({
    externalToken: sessionId,
  });

  let redirect = <Redirect to="/SignIn" />;
  data.then(data => {
    if (data.checkExternalToken && !data.checkExternalToken.error) {
      handleLogin(data.checkExternalToken.token);
      redirect = <Redirect to="/" />;
    }
  });

  return redirect;
};

ExternalAuth.propTypes = ExternalAuthPropTypes;

export default ExternalAuth;
