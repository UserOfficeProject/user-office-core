import React, { useEffect } from "react";
import { decode } from "jsonwebtoken";
import { useCookies } from "react-cookie";

const initUserData = {
  user: null,
  token: null,
  roles: null,
  currentRole: null
};

const checkLocalStorage = (dispatch, state) => {
  if (!state.token && localStorage.token && localStorage.currentRole) {
    const decoded = decode(localStorage.token);
    if (decoded && decoded.exp > Date.now() / 1000) {
      dispatch({
        type: "setUserFromLocalStorage",
        payload: {
          user: decoded.user,
          roles: decoded.roles,
          currentRole: localStorage.currentRole,
          token: localStorage.token,
          expToken: decoded.exp
        }
      });
    } else {
      localStorage.removeItem("token");
    }
  }
};

export const UserContext = React.createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "setUserFromLocalStorage":
      return {
        currentRole: action.payload.currentRole,
        user: action.payload.user,
        roles: action.payload.roles,
        token: action.payload.token,
        expToken: action.payload.expToken
      };
    case "loginUser":
      const decoded = decode(action.payload);
      localStorage.user = decoded.user;
      localStorage.token = action.payload;
      localStorage.expToken = decoded.exp;
      if (decoded.roles.length === 1) {
        localStorage.currentRole = decoded.roles[0].shortCode;
      }
      return {
        token: action.payload,
        user: decoded.user,
        expToken: decoded.exp,
        roles: decoded.roles,
        currentRole:
          decoded.roles.length === 1 ? decoded.roles[0].shortCode : null
      };
    case "setToken":
      const newToken = decode(action.payload);
      localStorage.token = action.payload;
      localStorage.expToken = newToken.exp;
      return {
        ...state,
        token: action.payload,
        expToken: newToken.exp
      };
    case "selectRole":
      localStorage.currentRole = action.payload;
      return {
        ...state,
        currentRole: action.payload
      };
    case "logOffUser":
      localStorage.removeItem("token");
      localStorage.removeItem("currentRole");
      localStorage.removeItem("user");
      localStorage.removeItem("expToken");
      return {
        initUserData
      };

    default:
      return state;
  }
};

export const UserContextProvider = props => {
  const [state, dispatch] = React.useReducer(reducer, initUserData);
  const [, setCookie] = useCookies();
  checkLocalStorage(dispatch, state);
  useEffect(() => {
    setCookie("token", state.token, { path: "/", secure: false });
  }, [setCookie, state]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        handleLogin: data => dispatch({ type: "loginUser", payload: data }),
        handleLogout: data => dispatch({ type: "logOffUser", payload: data }),
        handleRole: role => dispatch({ type: "selectRole", payload: role }),
        handleNewToken: token => dispatch({ type: "setToken", payload: token })
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
