import { useCallback, useState } from "react";
import { useDataApi } from "./useDataApi";

export function useUpdateProposalFiles() {
  const sendRequest = useDataApi();
  const [loading, setLoading] = useState(false);

  const updateProposalFiles = useCallback(
    async (parameters: {
      proposal_id: number;
      question_id: string;
      files: string[];
    }) => {
      setLoading(true);
      const result = await sendRequest()
        .updateProposalFiles(parameters)
        .then(resp => resp);
      setLoading(false);
      return result;
    },
    [sendRequest]
  );

  return { loading, updateProposalFiles };
}
