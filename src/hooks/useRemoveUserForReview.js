import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useRemoveUserForReview() {
  const sendRequest = useDataAPI();

  const sendRemoveReviewer = useCallback(
    async reviewID => {
      const query = `
        mutation($reviewID: Int!) {
          removeUserForReview(reviewID: $reviewID) {
            error
          }
        }
    `;
      const variables = {
        reviewID
      };

      return await sendRequest(query, variables).then(resp => resp);
    },
    [sendRequest]
  );

  return sendRemoveReviewer;
}
