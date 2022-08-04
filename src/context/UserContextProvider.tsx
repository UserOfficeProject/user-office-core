/* eslint-disable @typescript-eslint/no-explicit-any */
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { Role, UserRole, User, SettingsId } from 'generated/sdk';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';
import clearSession from 'utils/clearSession';

import { SettingsContext } from './SettingsContextProvider';

export type BasicUser = Pick<User, 'id' | 'email'>;

interface UserContextData {
  user: BasicUser;
  token: string;
  roles: Role[];
  currentRole: UserRole | null;
  impersonatingUserId: number | undefined;
  handleLogin: React.Dispatch<string | null | undefined>;
  handleNewToken: React.Dispatch<string | null | undefined>;
  handleLogout: () => Promise<void>;
  handleRole: React.Dispatch<string | null | undefined>;
}

interface DecodedTokenData
  extends Pick<UserContextData, 'user' | 'token' | 'roles'> {
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
  user: { id: 0, email: '' },
  token: '',
  roles: [],
  currentRole: null,
  impersonatingUserId: undefined,
  handleLogin: (value) => value,
  handleNewToken: (value) => value,
  handleLogout: async () => {
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
        token: action.payload.token,
        expToken: action.payload.expToken,
        impersonatingUserId: action.payload.impersonatingUserId,
      };
    case ActionType.LOGINUSER: {
      const { user, exp, roles, impersonatingUserId } = jwtDecode(
        action.payload
      ) as DecodedTokenData;
      localStorage.user = JSON.stringify(user);
      localStorage.token = action.payload;
      localStorage.expToken = exp;

      localStorage.currentRole = roles[0].shortCode.toUpperCase();
      localStorage.impersonatingUserId = impersonatingUserId;

      return {
        ...state,
        token: action.payload,
        user: user,
        expToken: exp,
        roles: roles,
        currentRole: roles[0].shortCode.toUpperCase(),
        impersonatingUserId: impersonatingUserId,
      };
    }
    case ActionType.SETTOKEN: {
      const { currentRole, roles, exp } = jwtDecode(
        action.payload
      ) as DecodedTokenData;
      localStorage.token = action.payload;
      localStorage.expToken = exp;
      localStorage.currentRole = currentRole.shortCode.toUpperCase();

      return {
        ...state,
        roles: roles,
        token: action.payload,
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
      clearSession();

      return {
        ...initUserData,
      };

    default:
      return state;
  }
};

function getCookieDomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length > 2) {
    // e.g. "www.example.com"
    const parts = hostname.split('.');
    parts.shift(); // remove the first part

    return `.${parts.join('.')}`;
  } else {
    return hostname; // e.g. localhost
  }
}

export const UserContextProvider: React.FC = (props): JSX.Element => {
  const [state, dispatch] = React.useReducer(reducer, initUserData);
  const [, setCookie] = useCookies();
  const unauthorizedApi = useUnauthorizedApi();
  const settingsContext = useContext(SettingsContext);

  checkLocalStorage(dispatch, state);
  useEffect(() => {
    const hostname = window.location.hostname;

    // NOTE: Cookies are used for scheduler authorization.
    setCookie('token', state.token, {
      path: '/',
      secure: false,
      domain: getCookieDomain(hostname),
      sameSite: 'lax',
    });
  }, [setCookie, state]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        handleLogin: (data): void =>
          dispatch({ type: ActionType.LOGINUSER, payload: data }),
        handleLogout: async () => {
          if (localStorage.token) {
            unauthorizedApi()
              .logout({
                token: localStorage.token,
              })
              .then(() => {
                dispatch({ type: ActionType.LOGOFFUSER, payload: null });

                const logoutUrl = settingsContext.settingsMap.get(
                  SettingsId.EXTERNAL_AUTH_LOGOUT_URL
                )?.settingsValue;

                if (logoutUrl) {
                  window.location.href = logoutUrl;
                }
              });
          }
        },
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
