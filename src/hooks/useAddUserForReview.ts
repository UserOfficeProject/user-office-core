import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useAddUserForReview() {
  const api = useDataApi();

  const sendAddReviewer = useCallback(
    async (userID, proposalID) => {
      return api()
        .addUserForReview({ userID, proposalID })
        .then(resp => resp.addUserForReview);
    },
    [api]
  );

  return sendAddReviewer;
}
