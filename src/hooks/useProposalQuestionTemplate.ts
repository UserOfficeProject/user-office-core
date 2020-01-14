import { useCallback } from "react";
import { ProposalTemplate } from "../models/ProposalModel";
import { useDataApi2 } from "./useDataApi2";

export function useProposalQuestionTemplate() {
  const api = useDataApi2();

  const getProposalTemplateRequest = useCallback(async () => {
    return new Promise<ProposalTemplate>((resolve, reject) => {
      api()
        .proposalTemplate()
        .then(data => {
          resolve(ProposalTemplate.fromObject(data.proposalTemplate));
        })
        .catch((e: any) => reject(e));
    });
  }, [api]);

  return getProposalTemplateRequest;
}
