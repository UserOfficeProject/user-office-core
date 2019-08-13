import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useAddReview() {
  const sendRequest = useDataAPI();

  const sendAddReview = useCallback(
    async (reviewID, grade, comment) => {
      const query = `
    mutation($reviewID: Int!, $grade: Int!, $comment: String!) {
      addReview(reviewID: $reviewID, grade: $grade, comment: $comment){
        id
        status
        comment
        grade
      }
    }
    `;
      const variables = {
        reviewID,
        grade,
        comment
      };

      return await sendRequest(query, variables).then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReview;
}
