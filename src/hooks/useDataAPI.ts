import { useContext, useCallback } from "react";
import { GraphQLClient } from "graphql-request";
import { UserContext } from "../context/UserContextProvider";

export function useDataAPI<T>(): (
  query: string,
  variables?: any
) => Promise<T> {
  const { token, expToken, handleNewToken, handleLogout } = useContext(
    UserContext
  );
  const endpoint = "/graphql";

  const sendRequestForToken = useCallback(async () => {
    const query = `
    mutation($token: String!) {
      token(token: $token){
        token
        error
      }
    }
    `;
    const variables = {
      token
    };
    return await new GraphQLClient(endpoint)
      .request(query, variables)
      .then(data =>
        data.token.error ? handleLogout() : handleNewToken(data.token.token)
      );
  }, [token, handleNewToken]);

  const sendRequest = useCallback(
    async function sendRequest(query, variables) {
      //check if token older than an hour, if so ask for new one
      if (expToken < Date.now() / 1000 + 7 * 24 * 3600 - 3600) {
        sendRequestForToken();
      }

      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      return await graphQLClient
        .request(query, variables)
        .then(data => {
          if (data.error) {
            console.log("Server responded with error", data.error);
          }
          return data;
        })
        .catch(error => console.log("Error", error));
    },
    [token, expToken, sendRequestForToken]
  );
  return sendRequest;
}
