import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId } from 'generated/sdk';
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
  const { search } = useLocation();
  const values = queryString.parse(search);
  const sessionId = !!values.sessionid
    ? values.sessionid.toString()
    : match.params.sessionId;

  const isFirstRun = useRef<boolean>(true);

  const settingsContext = useContext(SettingsContext);
  const externalAuthLoginUrl = settingsContext.settings.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  )?.settingsValue;

  useEffect(() => {
    if (!isFirstRun.current) {
      return;
    }
    isFirstRun.current = false;

    unauthorizedApi()
      .externalTokenLogin({
        externalToken: sessionId,
      })
      .then((token) => {
        if (token.externalTokenLogin && !token.externalTokenLogin.rejection) {
          handleLogin(token.externalTokenLogin.token);
          window.location.href = '/';
        } else {
          if (externalAuthLoginUrl) {
            window.location.href = externalAuthLoginUrl;
          }
        }
      });
  }, [token, handleLogin, sessionId, unauthorizedApi, externalAuthLoginUrl]);

  return <p>Logging in with external service...</p>;
};

ExternalAuth.propTypes = ExternalAuthPropTypes;

export default ExternalAuth;
