import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { Questionary } from "../models/ProposalModel";
import { ProposalInformation } from "../models/ProposalModel";

export function useProposalData(id: number | null) {
  const sendRequest = useDataAPI<any>();
  const [proposalData, setProposalData] = useState<ProposalInformation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getProposalInformation = (id: number) => {
      const query = `
          query($id: Int!) {
            proposal(id: $id) {
              id
              title
              abstract
              status
              shortCode
              excellenceScore
              safetyScore
              technicalScore
              proposer{
                id
                firstname
                lastname
              }
              users{
                firstname
                lastname
                organisation
                id
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
          shortCode: data.proposal.shortCode,
          excellenceScore: data.proposal.excellenceScore,
          safetyScore: data.proposal.safetyScore,
          technicalScore: data.proposal.technicalScore,
          proposer: {
            id: data.proposal.proposer.id,
            firstname: data.proposal.proposer.firstname,
            lastname: data.proposal.proposer.lastname,
            organisation: data.proposal.proposer.organisation
          },
          users: data.proposal.users.map((user: any) => {
            return {
              firstname: user.firstname,
              lastname: user.lastname,
              organisation: user.organisation,
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
    if (id) {
      getProposalInformation(id);
    }
  }, [id, sendRequest]);

  return { loading, proposalData };
}
