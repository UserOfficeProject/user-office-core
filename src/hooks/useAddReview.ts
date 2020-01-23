import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useAddReview() {
  const sendRequest = useDataApi();

  const sendAddReview = useCallback(
    async (reviewID, grade, comment) => {
      return await sendRequest()
        .addReview({
          reviewID,
          grade,
          comment
        })
        .then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReview;
}
