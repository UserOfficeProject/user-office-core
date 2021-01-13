import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef } from 'react';

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
  const { token, handleLogin } = useContext(UserContext);
  const unauthorizedApi = useUnauthorizedApi();
  const sessionId: string = match.params.sessionId;

  const isFirstRun = useRef<boolean>(true);

  useEffect(() => {
    if (!isFirstRun.current) {
      return;
    }
    isFirstRun.current = false;

    unauthorizedApi()
      .checkExternalToken({
        externalToken: sessionId,
      })
      .then(token => {
        if (token.checkExternalToken && !token.checkExternalToken.error) {
          handleLogin(token.checkExternalToken.token);
          window.location.href = '/';
        } else {
          if (process.env.REACT_APP_EXTERNAL_AUTH_LOGIN_URL) {
            window.location.href =
              process.env.REACT_APP_EXTERNAL_AUTH_LOGIN_URL;
          }
        }
      });
  }, [token, handleLogin, sessionId, unauthorizedApi]);

  return <p>Logging in with external service...</p>;
};

ExternalAuth.propTypes = ExternalAuthPropTypes;

export default ExternalAuth;
