import { GraphQLClient } from 'graphql-request';
import { Variables } from 'graphql-request/dist/src/types';
import { decode } from 'jsonwebtoken';
import { useSnackbar, WithSnackbarProps } from 'notistack';
import { useCallback, useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { getSdk } from 'generated/sdk';

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
      new UnauthorizedGraphQLClient(endpoint, enqueueSnackbar)
    ).addClientLog({ error });
  }
};

class UnauthorizedGraphQLClient extends GraphQLClient {
  constructor(
    private endpoint: string,
    private enqueueSnackbar: WithSnackbarProps['enqueueSnackbar']
  ) {
    super(endpoint);
  }

  async request<T extends any>(
    query: string,
    variables?: Variables
  ): Promise<T> {
    return super.request(query, variables).catch(error => {
      if (error.response.error.includes('ECONNREFUSED')) {
        notificationWithClientLog(this.enqueueSnackbar, 'Connection problem!');
      } else {
        notificationWithClientLog(
          this.enqueueSnackbar,
          'Something went wrong!',
          error.response.errors[0].message
        );
      }

      return error;
    }) as T;
  }
}

class AuthorizedGraphQLClient extends GraphQLClient {
  private renewalDate: number;

  constructor(
    private endpoint: string,
    private token: string,
    private enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'],
    private error?: (reason: string) => void,
    private tokenRenewed?: (newToken: string) => void
  ) {
    super(endpoint);
    token && this.setHeader('authorization', `Bearer ${token}`);
    this.renewalDate = this.getRenewalDate(token);
  }

  async request<T extends any>(
    query: string,
    variables?: Variables
  ): Promise<T> {
    const nowTimestampSeconds = Date.now() / 1000;
    if (this.renewalDate < nowTimestampSeconds) {
      const data = await getSdk(new GraphQLClient(this.endpoint)).getToken({
        token: this.token,
      });
      if (data.token.error) {
        this.error && this.error(data.token.error);
      } else {
        const newToken = data.token.token;
        this.setHeader('authorization', `Bearer ${newToken}`);
        this.tokenRenewed && this.tokenRenewed(newToken as string);
      }
    }

    return super.request(query, variables).catch(error => {
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

      this.error && this.error(error);

      return error;
    }) as T;
  }

  private getRenewalDate(token: string): number {
    const oneHour = 3600;

    return (decode(token) as any).iat + oneHour;
  }
}

export function useDataApi() {
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
              reason => {
                console.log(reason);
                handleLogout();
              },
              handleNewToken
            )
          : new GraphQLClient(endpoint)
      ),
    [token, handleNewToken, handleLogout, enqueueSnackbar]
  );
}

export function useUnauthorizedApi() {
  const { enqueueSnackbar } = useSnackbar();

  return getSdk(new UnauthorizedGraphQLClient(endpoint, enqueueSnackbar));
}
