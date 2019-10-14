import React from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ResetPassword from "./ResetPassword";
import ResetPasswordEmail from "./ResetPasswordEmail";
import EmailVerification from "./EmailVerification";
import RoleSelectionPage from "./RoleSelectionPage";
import DashBoard from "./DashBoard";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import {
  UserContextProvider,
  UserContext
} from "../context/UserContextProvider";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <UserContext.Consumer>
    {({ token, currentRole }) => (
      <Route
        {...rest}
        render={props => {
          if (!token) {
            return <Redirect to="/SignIn" />;
          } else if (token && !currentRole) {
            return <Redirect to="/RoleSelectionPage" />;
          } else {
            return <Component {...props} />;
          }
        }}
      />
    )}
  </UserContext.Consumer>
);

function App() {
  return (
    <CookiesProvider>
      <UserContextProvider>
        <Router>
          <div className="App">
            <Switch>
              <Route path="/SignUp" component={SignUp} />
              <Route path="/SignIn" component={SignIn} />
              <Route
                path="/ResetPasswordEmail"
                component={ResetPasswordEmail}
              />
              <Route path="/ResetPassword/:token" component={ResetPassword} />
              <Route
                path="/EmailVerification/:token"
                component={EmailVerification}
              />
              <Route
                path="/LogOut"
                render={() => (
                  <UserContext.Consumer>
                    {({ handleLogout }) => {
                      handleLogout();
                      return <Redirect to="/" />;
                    }}
                  </UserContext.Consumer>
                )}
              />

              <Route path="/RoleSelectionPage" component={RoleSelectionPage} />
              <PrivateRoute path="/" component={DashBoard} />
            </Switch>
          </div>
        </Router>
      </UserContextProvider>
    </CookiesProvider>
  );
}

export default App;
