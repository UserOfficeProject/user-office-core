import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useAddCall() {
  const api = useDataApi();

  const sendAddReview = useCallback(
    async (
      shortCode,
      startCall,
      endCall,
      startReview,
      endReview,
      startNotify,
      endNotify,
      cycleComment,
      surveyComment
    ) => {
      return await api()
        .createCall({
          shortCode,
          startCall,
          endCall,
          startReview,
          endReview,
          startNotify,
          endNotify,
          cycleComment,
          surveyComment
        })
        .then(resp => resp);
    },
    [api]
  );

  return sendAddReview;
}
