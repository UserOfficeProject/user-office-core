import { GraphQLClient } from "graphql-request";
import { Variables } from "graphql-request/dist/src/types";
import { decode } from "jsonwebtoken";
import { useCallback, useContext } from "react";
import { UserContext } from "../context/UserContextProvider";
import { getSdk } from "../generated/sdk";

export function useDataApi() {
  const { token, handleNewToken, handleLogout } = useContext(UserContext);
  const endpoint = "/graphql";

  const sendRequest = useCallback(
    function sendRequest() {
      return getSdk(
        token
          ? new AuthorizedGraphQLClient(
              endpoint,
              token,
              reason => {
                console.log(reason);
                handleLogout();
              },
              handleNewToken
            )
          : new GraphQLClient(endpoint)
      );
    },
    [token, handleNewToken, handleLogout]
  );
  return sendRequest;
}

class AuthorizedGraphQLClient extends GraphQLClient {
  private renewalDate: number;

  constructor(
    private endpoint: string,
    private token: string,
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
    const nowTimestampSeconds = Date.now() / 1000;
    if (this.renewalDate < nowTimestampSeconds) {
      const data = await getSdk(new GraphQLClient(this.endpoint)).getToken({
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

  private getRenewalDate(token: string): number {
    const oneHour = 3600;
    return (decode(token) as any).iat + oneHour;
  }
}
