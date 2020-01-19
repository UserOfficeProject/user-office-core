import { useCallback } from "react";
import { useDataApi2 } from "./useDataApi2";

export function useProposalQuestionTemplate() {
  const api = useDataApi2();

  const getProposalTemplate = useCallback(async () => {
    return api()
      .getProposalTemplate()
      .then(data => data.proposalTemplate);
  }, [api]);

  return getProposalTemplate;
}
