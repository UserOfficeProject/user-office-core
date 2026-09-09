import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, styled } from '@mui/material/styles';
import {
  MaterialDesignContent,
  SnackbarProvider,
  useSnackbar,
} from 'notistack';
import React, { ErrorInfo, Suspense, useEffect } from 'react';
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

export const DYNAMIC_IMPORT_ERROR_EVENT = 'dynamic-import-error';

function DynamicImportErrorSnackbar() {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const showPageLoadError = () => {
      enqueueSnackbar('Unable to load this page.', {
        variant: 'error',
        action: () => (
          <Button color="inherit" onClick={() => window.location.reload()}>
            Retry
          </Button>
        ),
      });
    };

    window.addEventListener(DYNAMIC_IMPORT_ERROR_EVENT, showPageLoadError);

    return () => {
      window.removeEventListener(DYNAMIC_IMPORT_ERROR_EVENT, showPageLoadError);
    };
  }, [enqueueSnackbar]);

  return null;
}

const StyledSnackbarContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-success': {
    backgroundColor: 'var(--PALETTE_SUCCESS_MAIN)',
    color: 'var(--PALETTE_PRIMARY_CONTRAST)',
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: 'var(--PALETTE_ERROR_MAIN)',
    color: 'var(--PALETTE_PRIMARY_CONTRAST)',
  },
  '&.notistack-MuiContent-warning': {
    backgroundColor: 'var(--PALETTE_WARNING_MAIN)',
    color: 'var(--PALETTE_PRIMARY_CONTRAST)',
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: 'var(--PALETTE_INFO_MAIN)',
    color: 'var(--PALETTE_SECONDARY_CONTRAST)',
  },
}));

function Root() {
  const notistackRef = React.useRef<SnackbarProvider>(null);

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
          Components={{
            success: StyledSnackbarContent,
            error: StyledSnackbarContent,
            warning: StyledSnackbarContent,
            info: StyledSnackbarContent,
          }}
          action={(key) => (
            <IconButton onClick={onClickDismiss(key)}>
              <Close htmlColor="white" />
            </IconButton>
          )}
        >
          <DynamicImportErrorSnackbar />
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
    } catch {
      errorMessage = 'Exception while preparing error message';
    } finally {
      void sendClientLog(errorMessage, this.state.errorToken);
    }
  }

  render() {
    return <RouterProvider router={router} />;
  }
}

export default App;
