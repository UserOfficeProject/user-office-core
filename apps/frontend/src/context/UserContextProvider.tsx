/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';

import { Role, UserRole, SettingsId, UserJwt } from 'generated/sdk';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';
import clearSession from 'utils/clearSession';

import { SettingsContext } from './SettingsContextProvider';

interface UserContextData {
  user: UserJwt;
  token: string;
  roles: Role[];
  currentRole: UserRole | null;
  impersonatingUserId: number | undefined;
  isInternalUser: boolean;
  handleLogin: React.Dispatch<string | null | undefined>;
  handleNewToken: React.Dispatch<string | null | undefined>;
  handleLogout: () => Promise<void>;
  handleSessionExpired: () => Promise<void>;
  handleRole: React.Dispatch<string | null | undefined>;
}

interface DecodedTokenData
  extends Pick<
    UserContextData,
    'user' | 'token' | 'isInternalUser' | 'roles' | 'impersonatingUserId'
  > {
  exp: number;
  currentRole: Role;
  impersonatingUserId: number | undefined;
}

enum ActionType {
  SETUSERFROMLOCALSTORAGE = 'setUserFromLocalStorage',
  LOGINUSER = 'loginUser',
  SETTOKEN = 'setToken',
  SELECTROLE = 'selectRole',
  LOGOFFUSER = 'logOffUser',
}

const initUserData: UserContextData = {
  user: {
    id: 0,
    email: '',
    firstname: '',
    lastname: '',
    oidcSub: '',
    institutionId: 0,
    created: '',
    placeholder: false,
    preferredname: '',
    position: '',
  },
  token: '',
  roles: [],
  currentRole: null,
  isInternalUser: false,
  impersonatingUserId: undefined,
  handleLogin: (value) => value,
  handleNewToken: (value) => value,
  handleLogout: async () => {
    return;
  },
  handleSessionExpired: async () => {
    return;
  },
  handleRole: (value) => value,
};

export const getCurrentUser = () =>
  jwtDecode(localStorage.token) as DecodedTokenData | null;

const checkLocalStorage = (
  dispatch: React.Dispatch<{
    type: ActionType;
    payload: any;
  }>,
  state: UserContextData
): void => {
  if (!state.token && localStorage.token && localStorage.currentRole) {
    const decoded = getCurrentUser();

    if (decoded && decoded.exp > Date.now() / 1000) {
      dispatch({
        type: ActionType.SETUSERFROMLOCALSTORAGE,
        payload: {
          user: decoded.user,
          roles: decoded.roles,
          currentRole: localStorage.currentRole,
          isInternalUser: decoded.isInternalUser,
          token: localStorage.token,
          expToken: decoded.exp,
          impersonatingUserId: decoded.impersonatingUserId,
        },
      });
    } else {
      clearSession();
    }
  }
};

export const UserContext = React.createContext<UserContextData>(initUserData);

const reducer = (
  state: UserContextData,
  action: { type: ActionType; payload: any }
): any => {
  switch (action.type) {
    case ActionType.SETUSERFROMLOCALSTORAGE:
      return {
        currentRole: action.payload.currentRole,
        user: action.payload.user,
        roles: action.payload.roles,
        isInternalUser: action.payload.isInternalUser,
        token: action.payload.token,
        expToken: action.payload.expToken,
        impersonatingUserId: action.payload.impersonatingUserId,
      };
    case ActionType.LOGINUSER: {
      const {
        user,
        exp,
        roles,
        isInternalUser,
        impersonatingUserId,
        currentRole,
      } = jwtDecode(action.payload) as DecodedTokenData;
      localStorage.user = JSON.stringify(user);
      localStorage.token = action.payload;
      localStorage.expToken = exp;
      localStorage.isInternalUser = isInternalUser;
      localStorage.currentRole = currentRole.shortCode.toUpperCase();
      localStorage.impersonatingUserId = impersonatingUserId;

      return {
        ...state,
        token: action.payload,
        user: user,
        expToken: exp,
        roles: roles,
        isInternalUser: isInternalUser,
        currentRole: roles[0].shortCode.toUpperCase(),
        impersonatingUserId: impersonatingUserId,
      };
    }
    case ActionType.SETTOKEN: {
      const { currentRole, roles, exp, isInternalUser } = jwtDecode(
        action.payload
      ) as DecodedTokenData;
      localStorage.token = action.payload;
      localStorage.expToken = exp;
      localStorage.currentRole = currentRole.shortCode.toUpperCase();
      localStorage.isInternalUser = isInternalUser;

      return {
        ...state,
        roles: roles,
        token: action.payload,
        isInternalUser: isInternalUser,
        expToken: exp,
        currentRole: currentRole.shortCode.toUpperCase(),
      };
    }
    case ActionType.SELECTROLE:
      localStorage.currentRole = action.payload.toUpperCase();

      return {
        ...state,
        currentRole: action.payload.toUpperCase(),
      };
    case ActionType.LOGOFFUSER:
      return {
        ...initUserData,
      };

    default:
      return state;
  }
};

export const UserContextProvider = (props: {
  children: React.ReactNode;
}): JSX.Element => {
  const [state, dispatch] = React.useReducer(reducer, initUserData);
  const unauthorizedApi = useUnauthorizedApi();
  const settingsContext = useContext(SettingsContext);

  checkLocalStorage(dispatch, state);

  async function userLogoutHandler() {
    const token = localStorage.getItem('token');
    if (token) {
      unauthorizedApi()
        .logout({ token })
        .finally(() => {
          const logoutUrl = settingsContext.settingsMap.get(
            SettingsId.EXTERNAL_AUTH_LOGOUT_URL
          )?.settingsValue;
          clearSession();
          if (logoutUrl) {
            window.location.assign(logoutUrl);
          } else {
            // if there is no logout url, just clear the user context
            dispatch({ type: ActionType.LOGOFFUSER, payload: null });
          }
        });
    }
  }

  async function userSessionExpiredHandler() {
    const loginUrl = settingsContext.settingsMap.get(
      SettingsId.EXTERNAL_AUTH_LOGIN_URL
    )?.settingsValue;
    clearSession();
    if (loginUrl) {
      const url = new URL(loginUrl);
      url.searchParams.set(
        'redirect_uri',
        encodeURI(`${window.location.href}external-auth`)
      );
      window.location.href = url.toString();
    } else {
      // if there is no logout url, just clear the user context
      dispatch({ type: ActionType.LOGOFFUSER, payload: null });
    }
  }

  return (
    <UserContext.Provider
      value={{
        ...state,
        handleLogin: (data): void =>
          dispatch({ type: ActionType.LOGINUSER, payload: data }),
        handleLogout: userLogoutHandler,
        handleSessionExpired: userSessionExpiredHandler,
        handleRole: (role: string): void =>
          dispatch({ type: ActionType.SELECTROLE, payload: role }),
        handleNewToken: useCallback(
          (token) => dispatch({ type: ActionType.SETTOKEN, payload: token }),
          []
        ),
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = { children: PropTypes.node.isRequired };
