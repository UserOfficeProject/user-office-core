import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React, { ErrorInfo, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import { DownloadContextProvider } from 'context/DownloadContextProvider';
import { FeatureContextProvider } from 'context/FeatureContextProvider';
import { IdleContextPicker } from 'context/IdleContextProvider';
import { SettingsContextProvider } from 'context/SettingsContextProvider';
import { UserContext, UserContextProvider } from 'context/UserContextProvider';
import { getUnauthorizedApi } from 'hooks/common/useDataApi';
import clearSession from 'utils/clearSession';

import DashBoard from './DashBoard';
import Theme from './theme/theme';
import ExternalAuth, { getCurrentUrlValues } from './user/ExternalAuth';

const PrivateOutlet = () => (
  <UserContext.Consumer>
    {({ roles, token, currentRole, handleRole }): JSX.Element => {
      if (!token) {
        const { queryParams, pathName } = getCurrentUrlValues();
        const redirectPath = queryParams.size
          ? `${pathName}?${queryParams.toString()}`
          : pathName;
        localStorage.redirectPath = redirectPath;

        return <Navigate to="/external-auth" />;
      }

      if (!currentRole) {
        handleRole(roles[0].shortCode);
      }

      return <Outlet />;
    }}
  </UserContext.Consumer>
);

const DefaultRoutes = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/external-auth/:sessionId" element={<ExternalAuth />} />
        <Route path="/external-auth/:token" element={<ExternalAuth />} />
        <Route path="/external-auth/:code" element={<ExternalAuth />} />
        <Route path="/external-auth/" element={<ExternalAuth />} />
        <Route path="/" element={<PrivateOutlet />}>
          <Route path="" element={<DashBoard />} />
        </Route>
      </Routes>
    </div>
  );
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
        errorInfo: errorInfo.componentStack?.toString(),
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
      <Suspense
        fallback={
          <div
            data-cy="loading"
            style={{
              display: 'flex',
              width: '100vw',
              height: '100vh',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Loading...
          </div>
        }
      >
        <StyledEngineProvider injectFirst>
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
                      <IdleContextPicker>
                        <Router>
                          <QueryParamProvider adapter={ReactRouter6Adapter}>
                            <DefaultRoutes />
                          </QueryParamProvider>
                        </Router>
                      </IdleContextPicker>
                    </DownloadContextProvider>
                  </UserContextProvider>
                </FeatureContextProvider>
              </Theme>
            </SettingsContextProvider>
          </SnackbarProvider>
        </StyledEngineProvider>
      </Suspense>
    );
  }
}

export default App;
