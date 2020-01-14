import { useState } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useSubmitProposal() {
  const sendRequest = useDataApi2();
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
