import { ThemeProvider } from '@material-ui/styles';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { CookiesProvider } from 'react-cookie';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import {
  UserContext,
  UserContextProvider,
} from '../context/UserContextProvider';
import { getUnauthorizedApi } from '../hooks/useDataApi';
import { getTheme } from '../theme';
import DashBoard from './DashBoard';
import EmailVerification from './user/EmailVerification';
import ResetPassword from './user/ResetPassword';
import ResetPasswordEmail from './user/ResetPasswordEmail';
import RoleSelectionPage from './user/RoleSelectionPage';
import SignIn from './user/SignIn';
import SignUp from './user/SignUp';

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
    localStorage.removeItem('token');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('user');
    localStorage.removeItem('expToken');
  }
  componentDidCatch(error, info) {
    getUnauthorizedApi().addClientLog(error);
  }
  render() {
    return (
      <ThemeProvider theme={getTheme()}>
        <CookiesProvider>
          <UserContextProvider>
            <SnackbarProvider
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              maxSnack={1}
            >
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
            </SnackbarProvider>
          </UserContextProvider>
        </CookiesProvider>
      </ThemeProvider>
    );
  }
}

export default App;
