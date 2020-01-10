import { GraphQLClient } from "graphql-request";
import { Variables } from "graphql-request/dist/src/types";
import { decode } from "jsonwebtoken";
import { useCallback, useContext } from "react";
import { UserContext } from "../context/UserContextProvider";
import { getSdk } from "../graphql/sdk";

export function useDataApi2() {
  const { token, handleNewToken, handleLogout } = useContext(UserContext);
  const endpoint = "/graphql";

  const sendRequest = useCallback(
    function sendRequest() {
      let tokenForRequest = token;
      //check if token older than an hour, if so ask for new one

      const graphQLClient = new AuthorizedGraphQLClient(
        endpoint,
        tokenForRequest,
        reason => {
          console.log(reason);
          handleLogout();
        },
        handleNewToken
      );

      return getSdk(graphQLClient);
    },
    [token, handleNewToken, handleLogout]
  );
  return sendRequest;
}

class AuthorizedGraphQLClient extends GraphQLClient {
  private renewalDate?: number;

  constructor(
    private endpoint: string,
    private token?: string,
    private error?: (reason: string) => void,
    private tokenRenewed?: (newToken: string) => void
  ) {
    super(endpoint);
    token && this.setHeader("authorization", `Bearer ${token}`);
    this.renewalDate = this.getRenewalDate(token);
  }

  async request<T extends any>(
    query: string,
    variables?: Variables
  ): Promise<T> {
    if (
      this.token !== undefined &&
      this.renewalDate !== undefined &&
      this.renewalDate < Date.now() / 1000
    ) {
      const data = await getSdk(new GraphQLClient(this.endpoint)).token({
        token: this.token
      });
      if (data.token.error) {
        this.error && this.error(data.token.error);
      } else {
        const newToken = data.token.token;
        this.setHeader("authorization", `Bearer ${newToken}`);
        this.tokenRenewed && this.tokenRenewed(newToken);
      }
    }
    return super.request(query, variables);
  }

  private getRenewalDate(token?: string): number | undefined {
    if (!token) {
      return undefined;
    }

    return 0;
    const oneWeek = 7 * 24 * 3600;
    const oneHour = 3600;
    // return (decode(token) as any).exp - (oneWeek - oneHour);
  }
}
