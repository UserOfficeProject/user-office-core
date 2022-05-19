/* eslint-disable @typescript-eslint/no-explicit-any */
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { Role, UserRole, User } from 'generated/sdk';
import { useUnauthorizedApi } from 'hooks/common/useDataApi';

export type BasicUser = Pick<User, 'id' | 'email'>;

interface UserContextData {
  user: BasicUser;
  token: string;
  roles: Role[];
  currentRole: UserRole | null;
  impersonatingUserId: number | undefined;
  handleLogin: React.Dispatch<string | null | undefined>;
  handleNewToken: React.Dispatch<string | null | undefined>;
  handleLogout: () => void;
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
  handleLogout: () => null,
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
      localStorage.removeItem('token');
      localStorage.removeItem('impersonatingUserId');
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
      localStorage.removeItem('token');
      localStorage.removeItem('currentRole');
      localStorage.removeItem('user');
      localStorage.removeItem('expToken');
      localStorage.removeItem('impersonatingUserId');

      return {
        ...initUserData,
      };

    default:
      return state;
  }
};

export const UserContextProvider: React.FC = (props): JSX.Element => {
  const [state, dispatch] = React.useReducer(reducer, initUserData);
  const [, setCookie] = useCookies();
  const unauthorizedApi = useUnauthorizedApi();

  checkLocalStorage(dispatch, state);
  useEffect(() => {
    const hostname = window.location.hostname;

    // NOTE: Cookies are used for scheduler authorization.
    setCookie('token', state.token, {
      path: '/',
      secure: false,
      // looks like domains like `localhost` or `proxy` in e2e
      // don't support .domain in browsers while setting cookies
      // include the leading dot only for "real" domains
      domain: hostname.includes('.') ? `.${hostname}` : hostname,
      sameSite: 'lax',
    });
  }, [setCookie, state]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        handleLogin: (data): void =>
          dispatch({ type: ActionType.LOGINUSER, payload: data }),
        handleLogout: () => {
          if (localStorage.token) {
            unauthorizedApi().logout({
              token: localStorage.token,
            });
          }

          dispatch({ type: ActionType.LOGOFFUSER, payload: null });
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
