import { useCallback } from "react";
import { useDataApi } from "./useDataApi";

export function useProposalQuestionTemplate() {
  const api = useDataApi();

  const getProposalTemplate = useCallback(async () => {
    return api()
      .getProposalTemplate()
      .then(data => data.proposalTemplate);
  }, [api]);

  return getProposalTemplate;
}
