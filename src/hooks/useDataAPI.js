import { useContext, useMemo } from "react";
import { GraphQLClient } from "graphql-request";
import { UserContext } from "../context/UserContextProvider";

export function useDataAPI() {
  const { token } = useContext(UserContext);

  const sendRequest = useMemo(
    () =>
      async function sendRequest(query, variables) {
        const endpoint = "/graphql";
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
    [token]
  );
  return sendRequest;
}
