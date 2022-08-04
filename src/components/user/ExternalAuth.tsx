import BugReportIcon from '@mui/icons-material/BugReport';
import Lock from '@mui/icons-material/Lock';
import { Button } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { StringParam, useQueryParams } from 'use-query-params';

import AnimatedEllipsis from 'components/AnimatedEllipsis';
import CenteredAlert from 'components/common/CenteredAlert';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId } from 'generated/sdk';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';

const ExternalAuthQueryParams = {
  sessionid: StringParam,
  token: StringParam,
  code: StringParam,
  error_description: StringParam,
};

function ExternalAuth() {
  const [urlQueryParams] = useQueryParams(ExternalAuthQueryParams);
  const externalToken = urlQueryParams.sessionid ?? urlQueryParams.code;

  const { token, handleLogin } = useContext(UserContext);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const unauthorizedApi = useUnauthorizedApi();
  const history = useHistory();

  const isFirstRun = useRef<boolean>(true);

  const settingsContext = useContext(SettingsContext);
  const externalAuthLoginUrl = settingsContext.settingsMap.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  )?.settingsValue;

  useEffect(() => {
    if (!isFirstRun.current) {
      return;
    }
    isFirstRun.current = false;

    if (!externalToken) {
      setError(
        urlQueryParams.error_description ??
          'Could not log in. Identity provider did not return a token.'
      );

      return;
    }

    unauthorizedApi()
      .externalTokenLogin({ externalToken })
      .then((token) => {
        if (token.externalTokenLogin.rejection) {
          setError(token.externalTokenLogin.rejection.reason);

          return;
        }
        if (token.externalTokenLogin) {
          handleLogin(token.externalTokenLogin.token);
          const landingUrl = localStorage.getItem('landingUrl'); // redirect to originally requested page successful after login
          localStorage.removeItem('landingUrl');
          window.location.href = landingUrl ?? '/';
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
    urlQueryParams.error_description,
  ]);

  if (error) {
    return (
      <CenteredAlert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            onClick={() => history.push('/')}
          >
            Return to frontpage
          </Button>
        }
        icon={<BugReportIcon fontSize="medium" />}
      >
        {error}
      </CenteredAlert>
    );
  }

  return (
    <CenteredAlert
      severity="info"
      action={
        <Button
          color="inherit"
          size="small"
          variant="outlined"
          onClick={() => history.push('/')}
        >
          Cancel
        </Button>
      }
      icon={<Lock />}
    >
      <AnimatedEllipsis>Verifying external authentication</AnimatedEllipsis>
    </CenteredAlert>
  );
}

export default ExternalAuth;
