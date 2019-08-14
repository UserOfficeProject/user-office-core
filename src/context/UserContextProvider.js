import React from "react";

//For Prod
const initUserData = {
  user: { roles: [], id: localStorage.id },
  token: localStorage.token,
  currentRole: localStorage.currentRole
};

const setLocalStorage = payload => {
  localStorage.token = payload.token;
  localStorage.id = payload.user.id;
  if (payload.user.roles.length === 1) {
    localStorage.currentRole = payload.user.roles[0];
  }
};

const resetLocalStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentRole");
  localStorage.removeItem("id");
};

export const UserContext = React.createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "loginUser":
      setLocalStorage(action.payload);
      return {
        ...action.payload,
        currentRole:
          action.payload.user.roles.length === 1
            ? action.payload.user.roles[0].shortCode
            : null
      };
    case "selectRole":
      localStorage.currentRole = action.payload;
      return {
        ...state,
        currentRole: action.payload
      };
    case "logOffUser":
      resetLocalStorage();
      localStorage.removeItem("token");
      localStorage.removeItem("currentRole");
      localStorage.removeItem("id");
      return {
        initUserData
      };

    default:
      return state;
  }
};

export const UserContextProvider = props => {
  const [state, dispatch] = React.useReducer(reducer, initUserData);

  return (
    <UserContext.Provider
      value={{
        ...state,
        handleLogin: data => dispatch({ type: "loginUser", payload: data }),
        handleLogout: data => dispatch({ type: "logOffUser", payload: data }),
        handleRole: role => dispatch({ type: "selectRole", payload: role })
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
