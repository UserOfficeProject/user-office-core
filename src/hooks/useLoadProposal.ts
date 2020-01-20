import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useLoadProposal() {
  const sendRequest = useDataApi2();

  const loadProposal = useCallback(
    async (id: number) => {
      return (await sendRequest().getProposal({ id })).proposal!;
    },
    [sendRequest]
  );

  return { loadProposal };
}
