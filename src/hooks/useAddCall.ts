import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useAddCall() {
  const sendRequest = useDataAPI();

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
      const query = `
    mutation($shortCode: String!, $startCall: String!, $endCall: String!, $startReview: String!, $endReview: String!, $startNotify: String!, $endNotify: String!, $cycleComment: String!, $surveyComment: String!) {
      createCall(shortCode: $shortCode, startCall: $startCall, endCall: $endCall, startReview: $startReview , endReview: $endReview , startNotify: $startNotify , endNotify: $endNotify , cycleComment: $cycleComment , surveyComment: $surveyComment){
        error
        call{
          id
        }
      }
    }
    `;
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

      return await sendRequest(query, variables).then(resp => resp);
    },
    [sendRequest]
  );

  return sendAddReview;
}
