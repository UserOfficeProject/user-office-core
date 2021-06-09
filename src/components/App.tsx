import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { ProviderContext, SnackbarProvider } from 'notistack';
import React, { ErrorInfo, useContext } from 'react';
import { CookiesProvider } from 'react-cookie';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteProps,
  Switch,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import { DownloadContextProvider } from 'context/DownloadContextProvider';
import { FeatureContextProvider } from 'context/FeatureContextProvider';
import { FeatureContext } from 'context/FeatureContextProvider';
import { ReviewAndAssignmentContextProvider } from 'context/ReviewAndAssignmentContextProvider';
import { SettingsContextProvider } from 'context/SettingsContextProvider';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext, UserContextProvider } from 'context/UserContextProvider';
import { FeatureId, SettingsId } from 'generated/sdk';
import { getUnauthorizedApi } from 'hooks/common/useDataApi';

import { getTheme } from '../themes/theme';
import DashBoard from './DashBoard';
import EmailVerification from './user/EmailVerification';
import ExternalAuth from './user/ExternalAuth';
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

  const featureContext = useContext(FeatureContext);
  const EXTERNAL_AUTH = !!featureContext.features.get(FeatureId.EXTERNAL_AUTH)
    ?.isEnabled;

  const settingsContext = useContext(SettingsContext);
  const EXTERNAL_AUTH_LOGIN_URL = settingsContext.settings.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  );

  return (
    <UserContext.Consumer>
      {({ roles, token, currentRole, handleRole }): JSX.Element => (
        <Route
          {...rest}
          render={(props): JSX.Element => {
            if (!token) {
              if (EXTERNAL_AUTH && EXTERNAL_AUTH_LOGIN_URL?.settingsValue) {
                window.location.href = EXTERNAL_AUTH_LOGIN_URL.settingsValue;

                return <p>Redirecting to external sign-in page...</p>;
              }

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

  private notistackRef = React.createRef<ProviderContext>();

  onClickDismiss = (key: string | number | undefined) => () => {
    this.notistackRef.current?.closeSnackbar(key);
  };

  render(): JSX.Element {
    let routes;
    if (process.env.REACT_APP_AUTH_TYPE === 'external') {
      routes = (
        <Switch>
          <Route path="/external-auth/:sessionId" component={ExternalAuth} />
          <PrivateRoute path="/" component={DashBoard} />
        </Switch>
      );
    } else {
      routes = (
        <Switch>
          <Route path="/SignUp" component={SignUp} />
          <Route path="/SignIn" component={SignIn} />
          <Route path="/shared-auth" component={SharedAuth} />
          <Route path="/ResetPasswordEmail" component={ResetPasswordEmail} />
          <Route path="/ResetPassword/:token" component={ResetPassword} />
          <Route
            path="/EmailVerification/:token"
            component={EmailVerification}
          />
          <PrivateRoute path="/" component={DashBoard} />
        </Switch>
      );
    }

    return (
      <ThemeProvider theme={getTheme()}>
        <CookiesProvider>
          <UserContextProvider>
            <SnackbarProvider
              ref={this.notistackRef}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              maxSnack={1}
              action={(key) => (
                <IconButton onClick={this.onClickDismiss(key)}>
                  <Close htmlColor="white" />
                </IconButton>
              )}
            >
              <SettingsContextProvider>
                <FeatureContextProvider>
                  <DownloadContextProvider>
                    <ReviewAndAssignmentContextProvider>
                      <Router>
                        <QueryParamProvider ReactRouterRoute={Route}>
                          <div className="App">{routes}</div>
                        </QueryParamProvider>
                      </Router>
                    </ReviewAndAssignmentContextProvider>
                  </DownloadContextProvider>
                </FeatureContextProvider>
              </SettingsContextProvider>
            </SnackbarProvider>
          </UserContextProvider>
        </CookiesProvider>
      </ThemeProvider>
    );
  }
}

export default App;
