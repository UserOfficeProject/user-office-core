/* eslint-disable react/prop-types */
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { SnackbarProvider } from 'notistack';
import React, { ErrorInfo } from 'react';
import { CookiesProvider } from 'react-cookie';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteProps,
  Switch,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import { ReviewAndAssignmentContextProvider } from 'context/ReviewAndAssignmentContextProvider';
import { UserContext, UserContextProvider } from 'context/UserContextProvider';
import { getUnauthorizedApi } from 'hooks/common/useDataApi';

import { getTheme } from '../theme';
import DashBoard from './DashBoard';
import EmailVerification from './user/EmailVerification';
import ResetPassword from './user/ResetPassword';
import ResetPasswordEmail from './user/ResetPasswordEmail';
import SharedAuth from './user/SharedAuth';
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    let errorMessage = '';
    try {
      errorMessage = JSON.stringify({
        error: error.toString(),
        errorInfo: errorInfo.componentStack.toString(),
      });
    } catch (e) {
      errorMessage = 'Exception while preparing error message';
    } finally {
      getUnauthorizedApi().addClientLog({ error: errorMessage });
    }
  }

  componentDidMount() {
    const primaryColor = getTheme().palette.primary.main;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', primaryColor);
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
                  <QueryParamProvider ReactRouterRoute={Route}>
                    <div className="App">
                      <Switch>
                        <Route path="/SignUp" component={SignUp} />
                        <Route path="/SignIn" component={SignIn} />
                        <Route path="/shared-auth" component={SharedAuth} />
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
                        <PrivateRoute path="/" component={DashBoard} />
                      </Switch>
                    </div>
                  </QueryParamProvider>
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
