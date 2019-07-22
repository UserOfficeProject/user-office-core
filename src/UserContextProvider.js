import React from "react";
import { GraphQLClient } from "graphql-request";

const initUserData = { user: { roles: [] }, token: null, currentRole: null };

//For development
// const [currentRole, setCurrentRole] = useState("user_officer");

// const [userData, setUserData] = useState({
//   token:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZXMiOlt7ImlkIjoxLCJzaG9ydENvZGUiOiJ1c2VyIiwidGl0bGUiOiJVc2VyIn0seyJpZCI6Miwic2hvcnRDb2RlIjoidXNlcl9vZmZpY2VyIiwidGl0bGUiOiJVc2VyIE9mZmljZXIifV0sImlhdCI6MTU2MTU1NTA5MywiZXhwIjoxNTkzMTEyNjkzfQ.84BAbKZzEZWD9Ayq-JVwY1PeMj1qUZKiz_JuumVoCMI",
//   user: {
//     roles: [
//       { id: 1, shortCode: "user", title: "User" },
//       { id: 2, shortCode: "user_officer", title: "User Officer" }
//     ]
//   }
// });

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

async function apiCall(token, query, variables) {
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
}

export const UserContextProvider = props => {
  const [state, dispatch] = React.useReducer(reducer, initUserData);

  return (
    <UserContext.Provider
      value={{
        ...state,
        handleLogin: data => dispatch({ type: "loginUser", payload: data }),
        handleLogout: data => dispatch({ type: "logOffUser", payload: data }),
        handleRole: role => dispatch({ type: "selectRole", payload: role }),
        apiCall: (query, variables) => apiCall(state.token, query, variables)
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};
