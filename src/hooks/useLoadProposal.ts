import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useLoadProposal() {
  const sendRequest = useDataApi();

  const loadProposal = useCallback(
    async (id: number) => {
      return (await sendRequest().getProposal({ id })).proposal!;
    },
    [sendRequest]
  );

  return { loadProposal };
}
