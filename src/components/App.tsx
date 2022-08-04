import Close from '@mui/icons-material/Close';
import Lock from '@mui/icons-material/Lock';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React, { ErrorInfo, useContext } from 'react';
import { CookiesProvider } from 'react-cookie';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  RouteProps,
  Switch,
  useHistory,
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
import clearSession from 'utils/clearSession';

import AnimatedEllipsis from './AnimatedEllipsis';
import CenteredAlert from './common/CenteredAlert';
import DashBoard from './DashBoard';
import Theme from './theme/theme';
import EmailVerification from './user/EmailVerification';
import ExternalAuth from './user/ExternalAuth';
import ResetPassword from './user/ResetPassword';
import ResetPasswordEmail from './user/ResetPasswordEmail';
import SharedAuth from './user/SharedAuth';

const PrivateRoute: React.FC<RouteProps> = ({ component, ...rest }) => {
  if (!component) {
    throw Error('component is undefined');
  }

  const Component = component; // JSX Elements have to be uppercase.

  const featureContext = useContext(FeatureContext);
  const isExternalAuthEnabled = !!featureContext.featuresMap.get(
    FeatureId.EXTERNAL_AUTH
  )?.isEnabled;

  const settingsContext = useContext(SettingsContext);
  const externalAuthLoginUrl = settingsContext.settingsMap.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  )?.settingsValue;

  const history = useHistory();

  return (
    <UserContext.Consumer>
      {({ roles, token, currentRole, handleRole }): JSX.Element => (
        <Route
          {...rest}
          render={(props): JSX.Element => {
            if (!token) {
              if (isExternalAuthEnabled && externalAuthLoginUrl) {
                localStorage.setItem('landingUrl', props.location.pathname);
                window.location.href = externalAuthLoginUrl;

                return (
                  <CenteredAlert
                    severity="info"
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        variant="outlined"
                        onClick={() => history.push('/')}
                      >
                        Cancel
                      </Button>
                    }
                    icon={<Lock fontSize="medium" />}
                  >
                    <AnimatedEllipsis>
                      Contacting authorization server
                    </AnimatedEllipsis>
                  </CenteredAlert>
                );
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

const Routes: React.FC<RouteProps> = () => {
  const featureContext = useContext(FeatureContext);
  const EXTERNAL_AUTH = !!featureContext.featuresMap.get(
    FeatureId.EXTERNAL_AUTH
  )?.isEnabled;

  if (EXTERNAL_AUTH) {
    return (
      <div className="App">
        <Switch>
          <Route path="/external-auth/:sessionId" component={ExternalAuth} />
          <Route path="/external-auth/:token" component={ExternalAuth} />
          <Route path="/external-auth/:code" component={ExternalAuth} />
          <Route path="/external-auth/" component={ExternalAuth} />
          <PrivateRoute path="/" component={DashBoard} />
        </Switch>
      </div>
    );
  } else {
    return (
      <div className="App">
        <Switch>
          <Route path="/shared-auth" component={SharedAuth} />
          <Route path="/ResetPasswordEmail" component={ResetPasswordEmail} />
          <Route path="/ResetPassword/:token" component={ResetPassword} />
          <Route
            path="/EmailVerification/:token"
            component={EmailVerification}
          />
          <PrivateRoute path="/" component={DashBoard} />
        </Switch>
      </div>
    );
  }
};

class App extends React.Component {
  state = { errorUserInformation: '' };
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    const user = localStorage.getItem('user');
    const errorUserInformation = {
      id: user ? JSON.parse(user).id : 'Not logged in',
      currentRole: localStorage.getItem('currentRole'),
    };

    clearSession();

    return { errorUserInformation };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    let errorMessage = '';
    try {
      errorMessage = JSON.stringify({
        error: error.toString(),
        errorInfo: errorInfo.componentStack.toString(),
        user: this.state.errorUserInformation,
      });
    } catch (e) {
      errorMessage = 'Exception while preparing error message';
    } finally {
      getUnauthorizedApi().addClientLog({ error: errorMessage });
    }
  }

  private notistackRef = React.createRef<SnackbarProvider>();

  onClickDismiss = (key: string | number | undefined) => () => {
    this.notistackRef.current?.closeSnackbar(key);
  };

  render(): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <CookiesProvider>
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
              <Theme>
                <FeatureContextProvider>
                  <UserContextProvider>
                    <DownloadContextProvider>
                      <ReviewAndAssignmentContextProvider>
                        <Router>
                          <QueryParamProvider ReactRouterRoute={Route}>
                            <Routes />
                          </QueryParamProvider>
                        </Router>
                      </ReviewAndAssignmentContextProvider>
                    </DownloadContextProvider>
                  </UserContextProvider>
                </FeatureContextProvider>
              </Theme>
            </SettingsContextProvider>
          </SnackbarProvider>
        </CookiesProvider>
      </StyledEngineProvider>
    );
  }
}

export default App;
