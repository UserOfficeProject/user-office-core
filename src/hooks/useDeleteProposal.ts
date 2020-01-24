import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useDeleteProposal() {
  const sendRequest = useDataApi();

  const deleteProposal = useCallback(
    async (id: number) => {
      return await sendRequest()
        .deleteProposal({ id })
        .then(resp => resp);
    },
    [sendRequest]
  );

  return deleteProposal;
}
