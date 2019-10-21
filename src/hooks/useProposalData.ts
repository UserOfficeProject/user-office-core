import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { Questionary } from "../model/ProposalModel";
import { ProposalInformation } from "../model/ProposalModel";

export function useProposalData(id: number) {
  const sendRequest = useDataAPI();
  const [proposalData, setProposalData] = useState<ProposalInformation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getProposalInformation = (id: number) => {
      const query = `
          query($id: ID!) {
            proposal(id: $id) {
              id
              title
              abstract
              status
              users{
                firstname
                lastname
                username
                id
              }
              questionary {
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
                    value
                    dependencies {
                      proposal_question_dependency
                      condition
                      proposal_question_id
                    }
                  }
                }
              }
              reviews{
                id
                grade
                comment
                status
                reviewer{
                  firstname
                  lastname
                  username
                  id
                }
              }
            }
          }
          `;

      const variables = {
        id
      };
      sendRequest(query, variables).then(data => {
        setProposalData({
          title: data.proposal.title,
          abstract: data.proposal.abstract,
          id: data.proposal.id,
          status: data.proposal.status,
          users: data.proposal.users.map((user: any) => {
            return {
              name: user.firstname,
              surname: user.lastname,
              username: user.username,
              id: user.id
            };
          }),
          reviews: data.proposal.reviews.map((review: any) => {
            return {
              id: review.id,
              grade: review.grade,
              comment: review.comment,
              reviewer: review.reviewer,
              status: review.status
            };
          }),
          questionary: Questionary.fromObject(data.proposal.questionary)
        });
        setLoading(false);
      });
    };
    getProposalInformation(id);
  }, [id, sendRequest]);

  return { loading, proposalData };
}
