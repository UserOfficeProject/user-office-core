import React, { createContext, useState, useEffect } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import RoleSelectionPage from "./RoleSelectionPage";
import DashBoard from "./DashBoard";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { GraphQLClient } from "graphql-request";

export const AppContext = createContext();

const PrivateRoute = ({ component: Component, userData, role, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!userData.token) {
        return <Redirect to="/SignIn" />;
      } else if (!role) {
        return <Redirect to="/RoleSelectionPage" />;
      } else {
        return <Component {...props} />;
      }
    }}
  />
);

async function apiCall(userData, query, variables) {
  const endpoint = "/graphql";
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${userData.token}`
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

function App() {
  // In prod
  const initUserData = { user: { roles: [] }, token: null };
  const [userData, setUserData] = useState(initUserData);
  const [currentRole, setCurrentRole] = useState(null);

  // check if user only has one role, in that case set it directly
  useEffect(() => {
    if (userData.user.roles.length === 1) {
      setCurrentRole(userData.user.roles[0].shortCode);
    }
  }, [userData.user.roles]);

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
  return (
    <Router>
      <div className="App">
        <AppContext.Provider
          value={{
            userData,
            currentRole,
            apiCall: apiCall.bind(this, userData)
          }}
        >
          <Switch>
            <Route path="/SignUp" component={SignUp} />
            <Route
              path="/SignIn"
              render={() => <SignIn onSuccess={setUserData} />}
            />
            <Route
              path="/LogOut"
              render={() => {
                setUserData(initUserData);
                setCurrentRole(null);
                return <Redirect to="/" />;
              }}
            />
            <Route
              path="/RoleSelectionPage"
              render={() => <RoleSelectionPage onSelect={setCurrentRole} />}
            />
            <PrivateRoute
              userData={userData}
              role={currentRole}
              path="/"
              component={DashBoard}
            />
          </Switch>
        </AppContext.Provider>
      </div>
    </Router>
  );
}

export default App;
