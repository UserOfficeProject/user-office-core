import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";

export function useDeleteProposal() {
  const sendRequest = useDataAPI();

  const deleteProposal = useCallback(
    async (id: number) => {
      const query = `
          mutation($id: Int!) {
            deleteProposal(id: $id) {
                 proposal{
                    id
                }
            }
          }
          `;

      const variables = {
        id
      };
      return await sendRequest(query, variables).then(resp => resp);
    },
    [sendRequest]
  );

  return deleteProposal;
}
