import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useRemoveUserForReview() {
  const sendRequest = useDataApi2();

  const sendRemoveReviewer = useCallback(
    async reviewID => {
      return await sendRequest()
        .removeUserForReview({
          reviewID
        })
        .then(resp => resp);
    },
    [sendRequest]
  );

  return sendRemoveReviewer;
}
