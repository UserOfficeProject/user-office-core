import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { Questionary } from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";

export function useCreateProposal() {
  const sendRequest = useDataAPI();
  const [proposal, setProposal] = useState<ProposalInformation | null>(null);

  useEffect(() => {
    const query = `
      mutation{
        createProposal{
         proposal{
          id
          status
          shortCode
          questionary {
            steps {
              topic {
                topic_title
                topic_id
              }
              isCompleted
              fields {
                proposal_question_id
                data_type
                question
                config
                value
                dependencies {
                  proposal_question_dependency
                  condition
                  proposal_question_id
                }
              }
            }
          }
        }
          error
        }
      }
      `;
    sendRequest(query).then(data => {
      const proposal = data.createProposal.proposal;
      proposal.questionary = Questionary.fromObject(proposal.questionary);
      setProposal(proposal);
    });
  }, [sendRequest]);

  return { proposal };
}
