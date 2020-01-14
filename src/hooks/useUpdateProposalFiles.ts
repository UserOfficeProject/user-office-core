import { useCallback, useState } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useUpdateProposalFiles() {
  const sendRequest = useDataApi2();
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
