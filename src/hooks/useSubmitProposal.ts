import { useState } from "react";
import { useDataApi } from "./useDataApi";

export function useSubmitProposal() {
  const sendRequest = useDataApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitProposal = async (id: number) => {
    setIsLoading(true);
    return sendRequest()
      .submitProposal({ id })
      .then(data => {
        setIsLoading(false);
        return !data.submitProposal.error;
      });
  };

  return { isLoading, submitProposal };
}
