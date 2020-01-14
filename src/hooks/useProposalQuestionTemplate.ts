import { useCallback } from "react";
import { ProposalTemplate } from "../models/ProposalModel";
import { useDataApi2 } from "./useDataApi2";

export function useProposalQuestionTemplate() {
  const api = useDataApi2();

  const getProposalTemplate = useCallback(async () => {
    return api()
      .proposalTemplate()
      .then(data => ProposalTemplate.fromObject(data.proposalTemplate));
  }, [api]);

  return getProposalTemplate;
}
