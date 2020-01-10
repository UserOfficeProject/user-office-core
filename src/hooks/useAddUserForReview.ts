import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useAddUserForReview() {
  const api = useDataApi2();

  const sendAddReviewer = useCallback(
    async (userID, proposalID) => {
      api()
        .addUserForReview({ userID, proposalID })
        .then(resp => resp.addUserForReview);
    },
    [api]
  );

  return sendAddReviewer;
}
