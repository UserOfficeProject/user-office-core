import { useState, useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useCreateProposal() {
  const sendRequest = useDataAPI();
  const [loading, setLoading] = useState(false);

  const createProposal = useCallback(async () => {
    const query = `
      mutation{
        createProposal{
         proposal{
          id
        }
          error
        }
      }
      `;
    setLoading(true);
    const result = await sendRequest(query);
    const proposal = result.createProposal.proposal;
    setLoading(false);
    return proposal.id;
  }, [sendRequest]);

  return { loading, createProposal };
}
