import { decode } from 'jsonwebtoken';
import PropTypes from 'prop-types';
import React, { useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie';

import { Role, UserRole } from 'generated/sdk';
import { User, dummyUser } from 'models/User';

interface UserContextData {
  user: User;
  token: string;
  roles: Role[];
  currentRole: UserRole | null;
  handleLogin: React.Dispatch<string | null | undefined>;
  handleNewToken: React.Dispatch<string | null | undefined>;
  handleLogout: () => void;
  handleRole: React.Dispatch<string | null | undefined>;
}

interface DecodedTokenData
  extends Pick<UserContextData, 'user' | 'token' | 'roles'> {
  exp: number;
  currentRole: Role;
}

enum ActionType {
  SETUSERFROMLOCALSTORAGE = 'setUserFromLocalStorage',
  LOGINUSER = 'loginUser',
  SETTOKEN = 'setToken',
  SELECTROLE = 'selectRole',
  LOGOFFUSER = 'logOffUser',
}

const initUserData: UserContextData = {
  user: dummyUser,
  token: '',
  roles: [],
  currentRole: null,
  handleLogin: value => value,
  handleNewToken: value => value,
  handleLogout: () => null,
  handleRole: value => value,
};

const checkLocalStorage = (
  dispatch: React.Dispatch<{
    type: ActionType;
    payload: any;
  }>,
  state: UserContextData
): void => {
  if (!state.token && localStorage.token && localStorage.currentRole) {
    const decoded = decode(localStorage.token) as DecodedTokenData;

    if (decoded?.exp > Date.now() / 1000) {
      dispatch({
        type: ActionType.SETUSERFROMLOCALSTORAGE,
        payload: {
          user: decoded.user,
          roles: decoded.roles,
          currentRole: localStorage.currentRole,
          token: localStorage.token,
          expToken: decoded.exp,
        },
      });
    } else {
      localStorage.removeItem('token');
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
      };
    case ActionType.LOGINUSER: {
      const { user, exp, roles } = decode(action.payload) as DecodedTokenData;
      localStorage.user = JSON.stringify(user);
      localStorage.token = action.payload;
      localStorage.expToken = exp;

      localStorage.currentRole = roles[0].shortCode.toUpperCase();

      return {
        ...state,
        token: action.payload,
        user: user,
        expToken: exp,
        roles: roles,
        currentRole: roles[0].shortCode.toUpperCase(),
      };
    }
    case ActionType.SETTOKEN: {
      const { currentRole, roles, exp } = decode(
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

  checkLocalStorage(dispatch, state);
  useEffect(() => {
    const hostname = window.location.hostname;

    setCookie('token', state.token, {
      path: '/',
      secure: false,
      // looks like domains like `localhost` or `proxy` in e2e
      // don't support .domain in browsers while setting cookies
      // include the leading dot only for "real" domains
      domain: hostname.includes('.') ? `.${hostname}` : hostname,
    });
  }, [setCookie, state]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        handleLogin: (data): void =>
          dispatch({ type: ActionType.LOGINUSER, payload: data }),
        // Using useCallback here as these are used in useDataAPI dependency array
        handleLogout: useCallback(
          () => dispatch({ type: ActionType.LOGOFFUSER, payload: null }),
          []
        ),
        handleRole: (role: string): void =>
          dispatch({ type: ActionType.SELECTROLE, payload: role }),
        handleNewToken: useCallback(
          token => dispatch({ type: ActionType.SETTOKEN, payload: token }),
          []
        ),
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = { children: PropTypes.node.isRequired };
