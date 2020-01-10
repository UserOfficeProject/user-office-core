import { useCallback, useState } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useCreateProposal() {
  const api = useDataApi2();
  const [loading, setLoading] = useState(false);

  const createProposal = useCallback(async () => {
    setLoading(true);
    const mutationResult = await api().createProposal();
    setLoading(false);
    return mutationResult.createProposal;
  }, [api]);

  return { loading, createProposal };
}
