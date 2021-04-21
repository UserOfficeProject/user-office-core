import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef } from 'react';

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
  const sessionId: string = match.params.sessionId;

  const isFirstRun = useRef<boolean>(true);

  const context = useContext(SettingsContext);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const external_auth_login_url = context.settings.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  );

  useEffect(() => {
    if (!isFirstRun.current) {
      return;
    }
    isFirstRun.current = false;

    unauthorizedApi()
      .checkExternalToken({
        externalToken: sessionId,
      })
      .then((token) => {
        if (token.checkExternalToken && !token.checkExternalToken.error) {
          handleLogin(token.checkExternalToken.token);
          window.location.href = '/';
        } else {
          if (external_auth_login_url) {
            window.location.href = external_auth_login_url.addValue;
          }
        }
      });
  }, [token, handleLogin, sessionId, unauthorizedApi, external_auth_login_url]);

  return <p>Logging in with external service...</p>;
};

ExternalAuth.propTypes = ExternalAuthPropTypes;

export default ExternalAuth;
