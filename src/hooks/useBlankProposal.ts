import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { Questionary } from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";

export function useBlankProposal() {
  const sendRequest = useDataAPI();
  const [proposal, setProposal] = useState<ProposalInformation | null>(null);

  useEffect(() => {
    const query = `
      query {
        blankProposal {
          id
          status
          shortCode
          proposer {
            id
            firstname
            lastname
            organisation
          }
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
    }`;
    sendRequest(query).then(data => {
      const proposal = data.blankProposal;
      proposal.questionary = Questionary.fromObject(proposal.questionary);
      setProposal(proposal);
    });
  }, [sendRequest]);

  return { proposal };
}
