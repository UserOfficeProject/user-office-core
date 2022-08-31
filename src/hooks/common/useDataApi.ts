/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLClient } from 'graphql-request';
import { ClientError, Variables } from 'graphql-request/dist/types';
import jwtDecode from 'jwt-decode';
import { useSnackbar, WithSnackbarProps } from 'notistack';
import { useCallback, useContext } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { getSdk, SettingsId } from 'generated/sdk';

const endpoint = '/graphql';

const notifyAndLog = async (
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'],
  userMessage: string,
  error: ClientError | string,
  writeToServerLog = true
) => {
  enqueueSnackbar(userMessage, {
    variant: 'error',
    preventDuplicate: true,
  });

  console.error({ userMessage, error });

  if (writeToServerLog) {
    await getSdk(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new UnauthorizedGraphQLClient(endpoint, enqueueSnackbar, true)
    ).addClientLog({ error: JSON.stringify({ userMessage, error }) });
  }
};

class UnauthorizedGraphQLClient extends GraphQLClient {
  constructor(
    private endpoint: string,
    private enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'],
    private skipErrorReport?: boolean
  ) {
    super(endpoint);
  }

  async request<T = any, V = Variables>(
    query: string,
    variables?: V
  ): Promise<T> {
    return super.request<T, V>(query, variables).catch((error: ClientError) => {
      // if the `notificationWithClientLog` fails
      // and it fails while reporting an error, it can
      // easily cause an infinite loop
      if (this.skipErrorReport) {
        throw error;
      }

      if (!error || !error.response) {
        notifyAndLog(
          this.enqueueSnackbar,
          'No response received from server',
          error
        );
      } else if (
        error.response.error &&
        error.response.error.includes('ECONNREFUSED')
      ) {
        notifyAndLog(this.enqueueSnackbar, 'Connection problem!', error, false);
      } else {
        notifyAndLog(this.enqueueSnackbar, 'Something went wrong!', error);
      }

      throw error;
    });
  }
}

class AuthorizedGraphQLClient extends GraphQLClient {
  private renewalDate: number;
  private externalToken: string;

  constructor(
    private endpoint: string,
    private token: string,
    private enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'],
    private onSessionExpired: () => void,
    private tokenRenewed?: (newToken: string) => void,
    private externalAuthLoginUrl?: string
  ) {
    super(endpoint);
    token && this.setHeader('authorization', `Bearer ${token}`);
    this.renewalDate = this.getRenewalDate(token);
    this.externalToken = this.getExternalToken(token);
  }

  async request<T = any, V = Variables>(
    query: string,
    variables?: V
  ): Promise<T> {
    const nowTimestampSeconds = Date.now() / 1000;
    if (this.renewalDate < nowTimestampSeconds) {
      const data = await getSdk(new GraphQLClient(this.endpoint)).getToken({
        token: this.token,
      });
      if (data.token.rejection) {
        notifyAndLog(
          this.enqueueSnackbar,
          'Server rejected user credentials',
          data.token.rejection.reason
        );
        this.onSessionExpired();
      } else {
        const newToken = data.token.token;
        this.setHeader('authorization', `Bearer ${newToken}`);
        this.tokenRenewed && this.tokenRenewed(newToken as string);
      }
    }

    return super.request<T, V>(query, variables).catch((error: ClientError) => {
      if (!error || !error.response) {
        notifyAndLog(
          this.enqueueSnackbar,
          'No response received from server',
          error
        );
      } else if (
        error.response.error &&
        error.response.error.includes('ECONNREFUSED')
      ) {
        notifyAndLog(this.enqueueSnackbar, 'Connection problem!', error, false);
      } else if (
        error.response.errors &&
        error.response.errors[0].message === 'EXTERNAL_TOKEN_INVALID' &&
        this.externalAuthLoginUrl
      ) {
        notifyAndLog(
          this.enqueueSnackbar,
          'Your session has expired, you will need to log in again through the external homepage',
          error,
          false
        );
        this.onSessionExpired();
      } else if ((jwtDecode(this.token) as any).exp < nowTimestampSeconds) {
        notifyAndLog(
          this.enqueueSnackbar,
          'Your session has expired, you will need to log in again.',
          error,
          false
        );
        this.onSessionExpired();
      } else {
        notifyAndLog(this.enqueueSnackbar, 'Something went wrong!', error);
      }

      throw error;
    });
  }

  private getRenewalDate(token: string): number {
    const oneHour = 3600;

    return (jwtDecode(token) as any).iat + oneHour;
  }

  private getExternalToken(token: string): string {
    return (jwtDecode(token) as any).externalToken;
  }
}

export function useDataApi() {
  const settingsContext = useContext(SettingsContext);
  const externalAuthLoginUrl = settingsContext.settingsMap.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  )?.settingsValue;
  const { token, handleNewToken, handleLogout } = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    () =>
      getSdk(
        token
          ? new AuthorizedGraphQLClient(
              endpoint,
              token,
              enqueueSnackbar,
              () => {
                handleLogout();
              },
              handleNewToken,
              externalAuthLoginUrl ? externalAuthLoginUrl : undefined
            )
          : new GraphQLClient(endpoint)
      ),
    [token, enqueueSnackbar, handleNewToken, externalAuthLoginUrl, handleLogout]
  );
}

export function useUnauthorizedApi() {
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    () => getSdk(new UnauthorizedGraphQLClient(endpoint, enqueueSnackbar)),
    [enqueueSnackbar]
  );
}

export function getUnauthorizedApi() {
  return getSdk(new GraphQLClient(endpoint));
}
