import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useAddCall() {
  const api = useDataApi2();

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
      const variables = {
        shortCode,
        startCall,
        endCall,
        startReview,
        endReview,
        startNotify,
        endNotify,
        cycleComment,
        surveyComment
      };

      return await api()
        .createCall(variables)
        .then(resp => resp);
    },
    [api]
  );

  return sendAddReview;
}
