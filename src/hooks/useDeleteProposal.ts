import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useDeleteProposal() {
  const sendRequest = useDataApi2();

  const deleteProposal = useCallback(
    async (id: number) => {
      const variables = {
        id
      };
      return await sendRequest()
        .deleteProposal(variables)
        .then(resp => resp);
    },
    [sendRequest]
  );

  return deleteProposal;
}
