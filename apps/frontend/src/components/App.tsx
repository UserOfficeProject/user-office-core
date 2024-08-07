import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React, { ErrorInfo, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import { DownloadContextProvider } from 'context/DownloadContextProvider';
import { FeatureContextProvider } from 'context/FeatureContextProvider';
import { IdleContextPicker } from 'context/IdleContextProvider';
import { SettingsContextProvider } from 'context/SettingsContextProvider';
import { UserContextProvider } from 'context/UserContextProvider';
import { getUnauthorizedApi } from 'hooks/common/useDataApi';
import clearSession from 'utils/clearSession';

import AppRoutes from './AppRoutes';
import Theme from './theme/theme';

function Root() {
  const notistackRef = React.createRef<SnackbarProvider>();

  const onClickDismiss = (key: string | number | undefined) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

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
          ref={notistackRef}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          maxSnack={1}
          action={(key) => (
            <IconButton onClick={onClickDismiss(key)}>
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
                      <QueryParamProvider adapter={ReactRouter6Adapter}>
                        <AppRoutes />
                      </QueryParamProvider>
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

const router = createBrowserRouter([{ path: '*', element: <Root /> }]);

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

  render(): JSX.Element {
    return <RouterProvider router={router} />;
  }
}

export default App;
