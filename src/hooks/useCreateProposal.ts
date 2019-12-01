import { useState, useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useCreateProposal() {
  const sendRequest = useDataAPI<any>();
  const [loading, setLoading] = useState(false);

  const createProposal = useCallback(async () => {
    const query = `
      mutation{
        createProposal{
         proposal{
          id
          status
          shortCode
        }
          error
        }
      }
      `;
    setLoading(true);
    const result = await sendRequest(query);
    const proposal = result.createProposal.proposal;
    setLoading(false);
    return proposal;
  }, [sendRequest]);

  return { loading, createProposal };
}
