import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useRemoveUserForReview() {
  const sendRequest = useDataApi();

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
