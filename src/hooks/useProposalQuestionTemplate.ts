import { useCallback } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalTemplate } from "../model/ProposalModel";

export function useProposalQuestionTemplate() {
  const sendRequest = useDataAPI();

  const getProposalTemplateRequest = useCallback(async () => {
    const query = `
            query {
              proposalTemplate {
                steps {
                  topic {
                    topic_title
                    topic_id
                  }
                  fields {
                    proposal_question_id
                    data_type
                    question
                    config
                    dependencies {
                      proposal_question_dependency
                      condition
                      proposal_question_id
                    }
                  }
                }
              }
            }`;

    return new Promise<ProposalTemplate>((resolve, reject) => {
      sendRequest(query)
        .then(data => {
          resolve(ProposalTemplate.fromObject(data.proposalTemplate));
        })
        .catch((e: any) => reject(e));
    });
  }, [sendRequest]); // passing empty array as a second param so that effect is called only once on mount

  return getProposalTemplateRequest;
}
