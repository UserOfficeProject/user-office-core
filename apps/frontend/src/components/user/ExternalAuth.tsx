import BugReportIcon from '@mui/icons-material/BugReport';
import Lock from '@mui/icons-material/Lock';
import { Button } from '@mui/material';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import AnimatedEllipsis from 'components/AnimatedEllipsis';
import CenteredAlert from 'components/common/CenteredAlert';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId } from 'generated/sdk';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';
import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
import clearSession from 'utils/clearSession';

export const getCurrentUrlValues = () => {
  const { protocol, host, pathname: pathName, search } = window.location;
  const currentUrlWithoutParams = [protocol, '//', host, pathName].join('');
  const queryParams = new URLSearchParams(search);

  queryParams.delete('sessionid');
  queryParams.delete('code');
  queryParams.delete('token');
  queryParams.delete('error_description');

  return {
    currentUrlWithoutParams,
    queryParams,
    pathName,
  };
};

function ExternalAuth() {
  const initialParams = useMemo(
    () => ({
      sessionid: null,
      code: null,
      token: null,
      error_description: null,
    }),
    []
  );

  const [typedParams] = useTypeSafeSearchParams<{
    sessionid: string | null;
    code: string | null;
    token: string | null;
    error_description: string | null;
  }>(initialParams);

  const {
    sessionid,
    code,
    token,
    error_description: errorDescription,
  } = typedParams;

  const unauthorizedApi = useUnauthorizedApi();
  const navigate = useNavigate();

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
              clearSession();
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
            onClick={() => navigate('/')}
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
            onClick={() => navigate('/')}
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
      const { currentUrlWithoutParams, queryParams } = getCurrentUrlValues();
      const redirectURL = queryParams.size
        ? `/?${queryParams.toString()}`
        : '/';
      const iss = queryParams.get('iss');
      setView(<ContactingAuthorizationServerMessage />);

      unauthorizedApi()
        .externalTokenLogin({
          externalToken: authorizationCode,
          redirectUri: currentUrlWithoutParams,
          iss: iss,
        })
        .then(({ externalTokenLogin }) => {
          handleLogin(externalTokenLogin);
          const previousPath = localStorage.getItem('redirectPath');
          clearSession('redirectPath');
          window.location.href = previousPath ?? redirectURL;
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
      const { currentUrlWithoutParams } = getCurrentUrlValues();
      const url = new URL(externalAuthLoginUrl);
      url.searchParams.set('redirect_uri', currentUrlWithoutParams);
      window.location.href = url.toString();
    };

    const handleError = (error: string) => {
      setView(<ErrorMessage message={error} />);
    };

    setView(<LoadingMessage />);

    const authorizationCode = sessionid ?? code ?? token;

    if (errorDescription) {
      handleError(errorDescription);
    } else if (authorizationCode) {
      handleAuthorizationCode(authorizationCode);
    } else {
      handleNoAuthorizationCode();
    }
  }, [
    code,
    errorDescription,
    handleLogin,
    navigate,
    sessionid,
    settingsMap,
    token,
    unauthorizedApi,
  ]);

  return View;
}
export default ExternalAuth;
