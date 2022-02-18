/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLClient } from 'graphql-request';
import { Variables } from 'graphql-request/dist/types';
import jwtDecode from 'jwt-decode';
import { useSnackbar, WithSnackbarProps } from 'notistack';
import { useCallback, useContext } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { getSdk, SettingsId } from 'generated/sdk';

const endpoint = '/graphql';

const notificationWithClientLog = async (
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'],
  message: string,
  error = ''
) => {
  enqueueSnackbar(message, {
    variant: 'error',
    preventDuplicate: true,
  });

  if (error) {
    await getSdk(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new UnauthorizedGraphQLClient(endpoint, enqueueSnackbar, true)
    ).addClientLog({ error });
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

  async request(query: string, variables?: Variables) {
    return super.request(query, variables).catch((error) => {
      // if the `notificationWithClientLog` fails
      // and it fails while reporting an error, it can
      // easily cause an infinite loop
      if (this.skipErrorReport) {
        throw error;
      }

      if (
        error.response.error &&
        error.response.error.includes('ECONNREFUSED')
      ) {
        notificationWithClientLog(this.enqueueSnackbar, 'Connection problem!');
      } else {
        notificationWithClientLog(
          this.enqueueSnackbar,
          'Something went wrong!',
          error.response.errors[0].message
        );
      }

      return error;
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
    private error?: (reason: string) => void,
    private tokenRenewed?: (newToken: string) => void,
    private externalAuthLoginUrl?: string
  ) {
    super(endpoint);
    token && this.setHeader('authorization', `Bearer ${token}`);
    this.renewalDate = this.getRenewalDate(token);
    this.externalToken = this.getExternalToken(token);
  }

  async request(query: string, variables?: Variables) {
    const nowTimestampSeconds = Date.now() / 1000;
    if (this.renewalDate < nowTimestampSeconds) {
      const data = await getSdk(new GraphQLClient(this.endpoint)).getToken({
        token: this.token,
      });
      if (data.token.rejection) {
        this.error && this.error(data.token.rejection.reason);
      } else {
        const newToken = data.token.token;
        this.setHeader('authorization', `Bearer ${newToken}`);
        this.tokenRenewed && this.tokenRenewed(newToken as string);
      }
    }

    return super.request(query, variables).catch((error) => {
      if (
        error.response.error &&
        error.response.error.includes('ECONNREFUSED')
      ) {
        notificationWithClientLog(this.enqueueSnackbar, 'Connection problem!');
      } else if (
        error.response.errors &&
        error.response.errors[0].message === 'EXTERNAL_TOKEN_INVALID' &&
        this.externalAuthLoginUrl
      ) {
        notificationWithClientLog(
          this.enqueueSnackbar,
          'Your session has expired, you will need to log in again through the external homepage'
        );

        this.error && this.error(error);

        return { data: null };
      } else if ((jwtDecode(this.token) as any).exp < nowTimestampSeconds) {
        this.enqueueSnackbar(
          'Your session has expired, you will need to log in again.',
          {
            variant: 'error',
            preventDuplicate: true,
          }
        );
      } else {
        notificationWithClientLog(
          this.enqueueSnackbar,
          'Something went wrong!',
          error?.response?.errors?.[0].message
        );
      }

      this.error && this.error(error);

      return error;
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
  const externalAuthLoginUrl = settingsContext.settings.get(
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
              (reason) => {
                console.log(reason);
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
