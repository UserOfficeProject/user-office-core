import React, { useContext } from "react";
import { GraphQLClient } from "graphql-request";

//For Prod
const initUserData = { user: { roles: [] }, token: null, currentRole: null };

//For development
// const initUserData = {
//   user: { roles: ["user_officer", "user"], id: 2 },
//   token:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNTYzODgzNzcxLCJleHAiOjE1OTU0NDEzNzF9.AOvbYPv21pi1VBPV0qM2oiyIESC-ugPfrgZolsb9dJk",
//   currentRole: "user_officer"
// };

export const UserContext = React.createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "loginUser":
      return {
        ...action.payload,
        currentRole:
          action.payload.user.roles.length === 1
            ? action.payload.user.roles[0].shortCode
            : null
      };
    case "selectRole":
      return {
        ...state,
        currentRole: action.payload
      };
    case "logOffUser":
      return {
        initUserData
      };

    default:
      return state;
  }
};

export function useDataAPI() {
  const { token } = useContext(UserContext);

  const sendRequest = (query, variables) => {
    const endpoint = "/graphql";
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    return graphQLClient
      .request(query, variables)
      .then(data => {
        if (data.error) {
          console.log("Server responded with error", data.error);
        }
        return data;
      })
      .catch(error => console.log("Error", error));
  };
  return sendRequest;
}

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
