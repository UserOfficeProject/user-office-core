import { useCallback, useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useUpdateProposalFiles() {
  const sendRequest = useDataAPI<any>();
  const [loading, setLoading] = useState(false);

  const updateProposalFiles = useCallback(
    async (parameters: { proposal_id: number, question_id?: string, files: string[] }) => {
      const query = `
      mutation($proposal_id: Int!, $question_id:String!, $files:[String]) {
        updateProposalFiles(proposal_id: $proposal_id, question_id:$question_id, files:$files){
         files
         error
        }
      }
      `;

      setLoading(true);
      const result = await sendRequest(query, parameters).then(resp => resp);
      setLoading(false);
      return result;
    },
    [sendRequest]

  );

  return { loading, updateProposalFiles };

}


