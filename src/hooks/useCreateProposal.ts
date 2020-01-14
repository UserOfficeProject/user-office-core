import { useCallback, useState } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useCreateProposal() {
  const api = useDataApi2();
  const [loading, setLoading] = useState(false);

  const createProposal = useCallback(async () => {
    setLoading(true);
    return api()
      .createProposal()
      .then(data => {
        setLoading(false);
        return data.createProposal;
      });
  }, [api]);

  return { loading, createProposal };
}
