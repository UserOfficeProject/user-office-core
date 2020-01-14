import { useState } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useSubmitProposal() {
  const sendRequest = useDataApi2();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitProposal = async (id: number) => {
    setIsLoading(true);
    await sendRequest().submitProposal({ id });
    setIsLoading(false);
    return true;
  };

  return { isLoading, submitProposal };
}
