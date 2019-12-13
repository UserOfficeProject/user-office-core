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
import { request } from "graphql-request";
import { ThemeProvider } from "@material-ui/styles";
import {
  UserContextProvider,
  UserContext
} from "../context/UserContextProvider";
import { getTheme } from "../theme";

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

class App extends React.Component {
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    localStorage.removeItem("token");
    localStorage.removeItem("currentRole");
    localStorage.removeItem("user");
    localStorage.removeItem("expToken");
  }
  componentDidCatch(error, info) {
    const query = `mutation($error: String){logError(error: $error)}`;
    request("/graphql", query, {
      error
    });
  }
  render() {
    return (
      <ThemeProvider theme={getTheme()}>
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
                  <Route
                    path="/ResetPassword/:token"
                    component={ResetPassword}
                  />
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

                  <Route
                    path="/RoleSelectionPage"
                    component={RoleSelectionPage}
                  />
                  <PrivateRoute path="/" component={DashBoard} />
                </Switch>
              </div>
            </Router>
          </UserContextProvider>
        </CookiesProvider>
      </ThemeProvider>
    );
  }
}

export default App;
