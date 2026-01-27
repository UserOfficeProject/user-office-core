import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import React, { ErrorInfo, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { DownloadContextProvider } from 'context/DownloadContextProvider';
import { FeatureContextProvider } from 'context/FeatureContextProvider';
import { IdleContextPicker } from 'context/IdleContextProvider';
import { SettingsContextProvider } from 'context/SettingsContextProvider';
import { UserContextProvider } from 'context/UserContextProvider';
import { sendClientLog } from 'hooks/common/useDataApi';
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
                      <AppRoutes />
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

type ErrorUserInformation = {
  id: string | number;
  currentRole: string | null;
};

type AppState = {
  errorUserInformation: ErrorUserInformation | null;
  errorToken: string | null;
};

class App extends React.Component<Record<string, never>, AppState> {
  state: AppState = { errorUserInformation: null, errorToken: null };
  static getDerivedStateFromError(): AppState {
    // Update state so the next render will show the fallback UI.
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const errorUserInformation: ErrorUserInformation = {
      id: user ? JSON.parse(user).id : 'Not logged in',
      currentRole: localStorage.getItem('currentRole'),
    };

    clearSession();

    return { errorUserInformation, errorToken: token };
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
      void sendClientLog(errorMessage, this.state.errorToken);
    }
  }

  render(): JSX.Element {
    return <RouterProvider router={router} />;
  }
}

export default App;
