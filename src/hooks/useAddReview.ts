import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";
import { Review } from "../models/Review";

export function useAddReview() {
  const sendRequest = useDataAPI<{ review: Review; error: string }>();

  const sendAddReview = useCallback(
    async (reviewID, grade, comment) => {
      const query = `
    mutation($reviewID: Int!, $grade: Int!, $comment: String!) {
      addReview(reviewID: $reviewID, grade: $grade, comment: $comment){
        error
        review {
          id
          status
          comment
          grade
        }
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
