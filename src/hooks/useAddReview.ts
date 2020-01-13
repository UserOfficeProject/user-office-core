import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useAddReview() {
  const sendRequest = useDataApi2();

  const sendAddReview = useCallback(
    async (reviewID, grade, comment) => {
      const variables = {
        reviewID,
        grade,
        comment
      };

      return await sendRequest()
        .addReview(variables)
        .then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReview;
}
