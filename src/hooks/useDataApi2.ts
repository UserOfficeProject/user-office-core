import { GraphQLClient } from "graphql-request";
import { useCallback, useContext } from "react";
import { UserContext } from "../context/UserContextProvider";
import { getSdk } from "../graphql/sdk";

export function useDataApi2() {
  const { token, expToken, handleNewToken, handleLogout } = useContext(
    UserContext
  );
  const endpoint = "/graphql";

  const sendRequest = useCallback(
    async function sendRequest() {
      let tokenForRequest = token;
      //check if token older than an hour, if so ask for new one
      if (expToken < Date.now() / 1000 + 7 * 24 * 3600 - 3600) {
        const data = await getSdk(new GraphQLClient(endpoint)).token({ token });
        if (data.token.error) {
          console.error(data);
          handleLogout();
        } else {
          handleNewToken(data.token.token);
          tokenForRequest = data.token.token;
        }
      }

      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          authorization: `Bearer ${tokenForRequest}`
        }
      });

      return getSdk(graphQLClient);
    },
    [token, expToken, handleNewToken, handleLogout]
  );
  return sendRequest;
}
