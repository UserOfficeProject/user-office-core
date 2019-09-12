import { useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useSubmitProposal() {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const sendRequest = useDataAPI();

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

    await sendRequest(query, variables);
    setSubmitted(true);
    return;
  };

  return { submitted, submitProposal };
}
