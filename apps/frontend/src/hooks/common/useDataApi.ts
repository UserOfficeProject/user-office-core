/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLClient } from 'graphql-request';
import { ClientError, RequestOptions, Variables } from 'graphql-request';
import { VariablesAndRequestHeadersArgs } from 'graphql-request/build/esm/types';
import jwtDecode from 'jwt-decode';
import { useSnackbar, WithSnackbarProps } from 'notistack';
import { useCallback, useContext } from 'react';

import { FeatureContext } from 'context/FeatureContextProvider';
import { IdleContext } from 'context/IdleContextProvider';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { FeatureId, getSdk, SettingsId } from 'generated/sdk';
import { RequestQuery } from 'utils/utilTypes';

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
    className: 'snackbar-error',
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

  async request<T = unknown, V extends Variables = Variables>(
    query: RequestQuery<T, V> | RequestOptions<V, T>,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> {
    return super
      .request<T, V>(query as RequestQuery<T, V>, ...variablesAndRequestHeaders)
      .catch((error) => {
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
          notifyAndLog(
            this.enqueueSnackbar,
            'Connection problem!',
            error,
            false
          );
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
    private handleUserActive: () => void,
    private isIdle: boolean,
    private isIdleContextEnabled?: boolean,
    private tokenRenewed?: (newToken: string) => void,
    private externalAuthLoginUrl?: string
  ) {
    super(endpoint);
    token && this.setHeader('authorization', `Bearer ${token}`);
    this.renewalDate = this.getRenewalDate(token);
    this.externalToken = this.getExternalToken(token);
  }

  async request<T = unknown, V extends Variables = Variables>(
    query: RequestQuery<T, V> | RequestOptions<V, T>,
    ...variablesAndRequestHeaders: VariablesAndRequestHeadersArgs<V>
  ): Promise<T> {
    const nowTimestampSeconds = Date.now() / 1000;
    if (this.renewalDate < nowTimestampSeconds) {
      try {
        const data = await getSdk(new GraphQLClient(this.endpoint)).getToken({
          token: this.token,
        });

        const newToken = data.token;
        this.setHeader('authorization', `Bearer ${newToken}`);
        this.tokenRenewed && this.tokenRenewed(newToken as string);
      } catch (error) {
        notifyAndLog(
          this.enqueueSnackbar,
          'Server rejected user credentials',
          JSON.stringify(error)
        );
        this.onSessionExpired();
      }
    }

    if (this.isIdleContextEnabled && !this.isIdle && this.externalToken) {
      this.handleUserActive();
    }

    return super
      .request<T, V>(query as RequestQuery<T, V>, ...variablesAndRequestHeaders)
      .catch((error) => {
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
          notifyAndLog(
            this.enqueueSnackbar,
            'Connection problem!',
            error,
            false
          );
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
          const [graphQLError] = error.response?.errors ?? [];

          notifyAndLog(
            this.enqueueSnackbar,
            graphQLError?.message || 'Something went wrong!',
            error
          );
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
  const featureContext = useContext(FeatureContext);
  const externalAuthLoginUrl = settingsContext.settingsMap.get(
    SettingsId.EXTERNAL_AUTH_LOGIN_URL
  )?.settingsValue;
  const isIdleContextEnabled = featureContext.featuresMap.get(
    FeatureId.STFC_IDLE_TIMER
  )?.isEnabled;

  const { token, handleNewToken, handleSessionExpired } =
    useContext(UserContext);
  const { handleUserActive, isIdle } = useContext(IdleContext);
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
                handleSessionExpired();
              },
              handleUserActive,
              isIdle,
              isIdleContextEnabled ? isIdleContextEnabled : undefined,
              handleNewToken,
              externalAuthLoginUrl ? externalAuthLoginUrl : undefined
            )
          : new GraphQLClient(endpoint)
      ),
    [
      token,
      enqueueSnackbar,
      handleUserActive,
      isIdle,
      isIdleContextEnabled,
      handleNewToken,
      externalAuthLoginUrl,
      handleSessionExpired,
    ]
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
