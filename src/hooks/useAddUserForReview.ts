import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";
import { Review } from "../models/Review";

export function useAddUserForReview() {
  const sendRequest = useDataAPI<{ review: Review; error: string }>();

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

      return sendRequest(query, variables).then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReviewer;
}
