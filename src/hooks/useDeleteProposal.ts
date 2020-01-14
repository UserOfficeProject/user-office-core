import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useDeleteProposal() {
  const sendRequest = useDataApi2();

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
