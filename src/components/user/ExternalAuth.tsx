import React, { useContext, useEffect, useRef } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId } from 'generated/sdk';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';

const ExternalAuthQueryParams = {
  sessionid: StringParam,
  token: StringParam,
};

function ExternalAuth() {
  const [urlQueryParams] = useQueryParams(ExternalAuthQueryParams);
  const externalToken = urlQueryParams.sessionid ?? urlQueryParams.token;

  const { token, handleLogin } = useContext(UserContext);
  const unauthorizedApi = useUnauthorizedApi();

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

    if (!externalToken) {
      return;
    }

    unauthorizedApi()
      .externalTokenLogin({ externalToken })
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
  }, [
    token,
    handleLogin,
    externalToken,
    unauthorizedApi,
    externalAuthLoginUrl,
  ]);

  return <p>Logging in with external service...</p>;
}

export default ExternalAuth;
