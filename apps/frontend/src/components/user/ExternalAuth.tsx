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

  const unauthorizedApi = useUnauthorizedApi();
  const history = useHistory();

  const isFirstRun = useRef<boolean>(true);

  const { handleLogin } = useContext(UserContext);
  const { settingsMap } = useContext(SettingsContext);

  const [View, setView] = React.useState<JSX.Element | null>(null);

  useEffect(() => {
    if (!isFirstRun.current) {
      return;
    }

    isFirstRun.current = false;

    const ErrorMessage = (props: { message?: string }) => (
      <CenteredAlert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            variant="outlined"
            onClick={() => {
              localStorage.clear();
              window.location.assign('/');
            }}
          >
            Return to frontpage
          </Button>
        }
        icon={<BugReportIcon fontSize="medium" />}
      >
        {props.message || 'Unknown error occurred'}
      </CenteredAlert>
    );

    const LoadingMessage = () => (
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
        <AnimatedEllipsis>Please wait</AnimatedEllipsis>
      </CenteredAlert>
    );

    const ContactingAuthorizationServerMessage = () => (
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
        icon={<Lock fontSize="medium" />}
      >
        <AnimatedEllipsis>Contacting authorization server</AnimatedEllipsis>
      </CenteredAlert>
    );

    const handleAuthorizationCode = (authorizationCode: string) => {
      const { protocol, host, pathname } = window.location;
      const currentUrlWithoutParams = [protocol, '//', host, pathname].join('');

      setView(<ContactingAuthorizationServerMessage />);

      unauthorizedApi()
        .externalTokenLogin({
          externalToken: authorizationCode,
          redirectUri: currentUrlWithoutParams,
        })
        .then(({ externalTokenLogin }) => {
          handleLogin(externalTokenLogin);
          window.location.href = '/';
        })
        .catch((error) => {
          setView(<ErrorMessage message={error.message} />);
        });
    };

    const handleNoAuthorizationCode = () => {
      const externalAuthLoginUrl = settingsMap.get(
        SettingsId.EXTERNAL_AUTH_LOGIN_URL
      )?.settingsValue;
      if (!externalAuthLoginUrl) {
        setView(<ErrorMessage message="System configuration error" />);

        return;
      }
      const url = new URL(externalAuthLoginUrl);
      url.searchParams.set('redirect_uri', encodeURI(window.location.href));
      window.location.href = url.toString();
    };

    const handleError = (error: string) => {
      setView(<ErrorMessage message={error} />);
    };

    setView(<LoadingMessage />);

    const errorDescription = urlQueryParams.error_description;
    const authorizationCode =
      urlQueryParams.sessionid ?? urlQueryParams.code ?? urlQueryParams.token;

    if (errorDescription) {
      handleError(errorDescription);
    } else if (authorizationCode) {
      handleAuthorizationCode(authorizationCode);
    } else {
      handleNoAuthorizationCode();
    }
  }, [
    handleLogin,
    history,
    settingsMap,
    unauthorizedApi,
    urlQueryParams.code,
    urlQueryParams.error_description,
    urlQueryParams.sessionid,
    urlQueryParams.token,
  ]);

  return View;
}
export default ExternalAuth;
