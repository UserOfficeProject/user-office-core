import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalTemplate } from "../model/ProposalModel";

export function useProposalQuestionTemplate() {
  const sendRequest = useDataAPI();
  const [proposalQuestionModel, setProposalQuestionModel] = useState<ProposalTemplate>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProposalTemplateRequest = () => {
      const query = `
            query {
              proposalTemplate{
                error
                template {
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

      sendRequest(query).then(data => {
        setLoading(false);
        setProposalQuestionModel(
          new ProposalTemplate(data.proposalTemplate.template)
        );
      });
    };
    getProposalTemplateRequest();
  }, []); // passing empty array as a second param so that effect is called only once on mount

  return { loading, proposalQuestionModel };
}
