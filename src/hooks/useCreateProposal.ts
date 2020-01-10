import { useCallback, useState } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useCreateProposal() {
  const sendRequest = useDataApi2();
  const [loading, setLoading] = useState(false);

  const createProposal = useCallback(async () => {
    setLoading(true);
    const mutationResult = await sendRequest().createProposal();
    setLoading(false);
    return mutationResult.createProposal;
  }, [sendRequest]);

  return { loading, createProposal };
}
