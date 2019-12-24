import { useCallback } from "react";
import { useDataAPI } from "../hooks/useDataAPI";

export function useAddUserForReview() {
  const sendRequest = useDataAPI();

  const sendAddReviewer = useCallback(
    async (userID, proposalID) => {
      const query = `
    mutation($userID: Int!, $proposalID: Int!) {
      addUserForReview(userID: $userID, proposalID: $proposalID) {
        error
      }
    }
    `;
      const variables = {
        userID,
        proposalID
      };

      return await sendRequest(query, variables).then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReviewer;
}
