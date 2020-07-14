/* eslint-disable react/prop-types */
import { ThemeProvider } from '@material-ui/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { CookiesProvider } from 'react-cookie';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
  RouteProps,
} from 'react-router-dom';

import { ReviewAndAssignmentContextProvider } from '../context/ReviewAndAssignmentContextProvider';
import {
  UserContext,
  UserContextProvider,
} from '../context/UserContextProvider';
import { useUnauthorizedApi } from '../hooks/useDataApi';
import { getTheme } from '../theme';
import DashBoard from './DashBoard';
import EmailVerification from './user/EmailVerification';
import ResetPassword from './user/ResetPassword';
import ResetPasswordEmail from './user/ResetPasswordEmail';
import SignIn from './user/SignIn';
import SignUp from './user/SignUp';

const PrivateRoute: React.FC<RouteProps> = ({ component, ...rest }) => {
  if (!component) {
    throw Error('component is undefined');
  }

  const Component = component; // JSX Elements have to be uppercase.

  return (
    <UserContext.Consumer>
      {({ roles, token, currentRole, handleRole }): JSX.Element => (
        <Route
          {...rest}
          render={(props): JSX.Element => {
            if (!token) {
              return <Redirect to="/SignIn" />;
            } else {
              if (!currentRole) {
                handleRole(roles[0].shortCode);
              }

              return <Component {...props} />;
            }
          }}
        />
      )}
    </UserContext.Consumer>
  );
};

class App extends React.Component {
  static getDerivedStateFromError(): void {
    // Update state so the next render will show the fallback UI.
    localStorage.removeItem('token');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('user');
    localStorage.removeItem('expToken');
  }

  componentDidCatch(error: any): void {
    useUnauthorizedApi().addClientLog(error);
  }

  render(): JSX.Element {
    return (
      <ThemeProvider theme={getTheme()}>
        <CookiesProvider>
          <UserContextProvider>
            <SnackbarProvider
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              maxSnack={1}
            >
              <ReviewAndAssignmentContextProvider>
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
                        render={(): JSX.Element => (
                          <UserContext.Consumer>
                            {({ handleLogout }): JSX.Element => {
                              handleLogout();

                              return <Redirect to="/" />;
                            }}
                          </UserContext.Consumer>
                        )}
                      />

                      <PrivateRoute path="/" component={DashBoard} />
                    </Switch>
                  </div>
                </Router>
              </ReviewAndAssignmentContextProvider>
            </SnackbarProvider>
          </UserContextProvider>
        </CookiesProvider>
      </ThemeProvider>
    );
  }
}

export default App;
