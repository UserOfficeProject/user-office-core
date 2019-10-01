import React from "react";
import { ThemeProvider } from '@material-ui/styles';
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ResetPassword from "./ResetPassword";
import ResetPasswordEmail from "./ResetPasswordEmail";
import RoleSelectionPage from "./RoleSelectionPage";
import DashBoard from "./DashBoard";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Redirect } from "react-router-dom";
import {
  UserContextProvider,
  UserContext
} from "../context/UserContextProvider";
import {getTheme} from "../theme"



const PrivateRoute = ({ component: Component, ...rest }) => (
  <UserContext.Consumer>
    {({ token, currentRole }) => (
      <Route
        {...rest}
        render={props => {
          if (!token) {
            return <Redirect to="/SignIn" />;
          } else if (!currentRole) {
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
    <ThemeProvider theme={getTheme()}>
    <UserContextProvider>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/SignUp" component={SignUp} />
            <Route path="/SignIn" component={SignIn} />
            <Route path="/ResetPasswordEmail" component={ResetPasswordEmail} />
            <Route path="/ResetPassword/:token" component={ResetPassword} />
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
    </ThemeProvider>
  );
}

export default App;
