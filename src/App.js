import React, { createContext, useState } from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import LogOut from "./LogOut";
import RoleSelectionPage from "./RoleSelectionPage";
import DashBoard from "./DashBoard";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { GraphQLClient } from "graphql-request";

export const AppContext = createContext();

const PrivateRoute = ({ component: Component, authed, role, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!authed) {
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
  const [userData, setUserData] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  if (userData && userData.role && userData.role.length === 1) {
    setCurrentRole(userData.role[0]);
  }
  // For development
  // const [userData, setUserData] = useState({
  //   token:
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZXMiOlt7ImlkIjoxLCJzaG9ydENvZGUiOiJ1c2VyIiwidGl0bGUiOiJVc2VyIn0seyJpZCI6Miwic2hvcnRDb2RlIjoidXNlcl9vZmZpY2VyIiwidGl0bGUiOiJVc2VyIE9mZmljZXIifV0sImlhdCI6MTU2MTU1NTA5MywiZXhwIjoxNTkzMTEyNjkzfQ.84BAbKZzEZWD9Ayq-JVwY1PeMj1qUZKiz_JuumVoCMI",
  //   user: {}
  // });
  return (
    <Router>
      <div className="App">
        <AppContext.Provider
          value={{
            userData,
            currentRole,
            setUserData,
            setCurrentRole,
            apiCall: apiCall.bind(this, userData)
          }}
        >
          <Switch>
            <Route path="/SignUp" component={SignUp} />
            <Route path="/SignIn" component={SignIn} />
            <Route path="/LogOut" component={LogOut} />
            <Route path="/RoleSelectionPage" component={RoleSelectionPage} />
            <PrivateRoute
              authed={userData}
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
