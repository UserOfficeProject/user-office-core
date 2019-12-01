import { useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useSubmitProposal() {
  const sendRequest = useDataAPI<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitProposal = async (id: number) => {
    const query = `
    mutation($id: Int!){
      submitProposal(id: $id){
       proposal{
        id
      }
        error
      }
    }
    `;
    const variables = {
      id
    };

    setIsLoading(true);
    await sendRequest(query, variables);
    setIsLoading(false);
    return true;
  };

  return { isLoading, submitProposal };
}
