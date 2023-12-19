/* eslint-disable @typescript-eslint/no-explicit-any */
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import React, { useContext, useRef } from 'react';

import IdleTimeoutPrompt from 'components/timeout/TimeOutPrompt';
import { FeatureId, SettingsId } from 'generated/sdk';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';

import { FeatureContext } from './FeatureContextProvider';
import { SettingsContext } from './SettingsContextProvider';
import { UserContext } from './UserContextProvider';

interface IdleContextData {
  sessionTimer: NodeJS.Timeout | undefined;
  logoutTimer: NodeJS.Timeout | undefined;
  isIdle: boolean;
  handleUserActive: () => void;
}

const initIdleData: IdleContextData = {
  sessionTimer: undefined,
  logoutTimer: undefined,
  isIdle: false,
  handleUserActive: () => {},
};

export const IdleContext = React.createContext<IdleContextData>(initIdleData);

export const EmptyIdleContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const [state] = React.useState(initIdleData);

  return (
    <IdleContext.Provider
      value={{
        ...state,
      }}
    >
      {props.children}
    </IdleContext.Provider>
  );
};

export const IdleContextProvider = (props: { children: React.ReactNode }) => {
  const [state, setState] = React.useState(initIdleData);
  // Faparate state to avoid weirdness  s timeouts use the state of when they are started

  const unauthorizedApi = useUnauthorizedApi();
  const { token } = useContext(UserContext);
  const { settingsMap } = useContext(SettingsContext);

  const externalAuthLoginUrl = settingsMap.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  )?.settingsValue;
  const idleTimeoutLength = settingsMap.get(
    SettingsId.IDLE_TIMEOUT
  )?.settingsValue;

  const idleTimeout = useRef<NodeJS.Timeout>();

  const userIdleTimer = function () {
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }

    return setTimeout(
      () => {
        setState({
          ...state,
          isIdle: true,
        });
      },
      // Timeout in milliseconds
      idleTimeoutLength ? parseInt(idleTimeoutLength) : 3600000
    );
  };

  function userActive() {
    idleTimeout.current = userIdleTimer();

    if (state.isIdle)
      setState({
        ...state,
        isIdle: false,
      });
  }

  function userActiveButton() {
    unauthorizedApi()
      .checkExternalToken({ token: (jwtDecode(token) as any).externalToken })
      .then((res) => {
        if (!res.checkExternalToken.isValid && externalAuthLoginUrl) {
          const url = new URL(externalAuthLoginUrl);
          url.searchParams.set('redirect_uri', encodeURI(window.location.href));
          window.location.href = url.toString();
        }
      });

    userActive();
  }

  return (
    <IdleContext.Provider
      value={{
        ...state,
        handleUserActive: userActive,
      }}
    >
      {props.children}
      <IdleTimeoutPrompt isIdle={state.isIdle} onConfirm={userActiveButton} />
    </IdleContext.Provider>
  );
};

IdleContextProvider.propTypes = { children: PropTypes.node.isRequired };

export const IdleContextPicker = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const featureContext = useContext(FeatureContext);

  const isIdleContextEnabled = featureContext.featuresMap.get(
    FeatureId.STFC_IDLE_TIMER
  )?.isEnabled;

  return isIdleContextEnabled ? (
    <IdleContextProvider>{children}</IdleContextProvider>
  ) : (
    <EmptyIdleContextProvider>{children}</EmptyIdleContextProvider>
  );
};

IdleContextPicker.propTypes = { children: PropTypes.node.isRequired };
