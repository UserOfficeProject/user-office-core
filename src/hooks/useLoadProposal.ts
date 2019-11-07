import { useState, useCallback } from "react";
import { useDataAPI } from "./useDataAPI";
import { Questionary } from "../models/ProposalModel";

export function useLoadProposal() {
  const [loading] = useState(true);
  const sendRequest = useDataAPI();

  const loadProposal = useCallback(
    async (id: number) => {
      const query = `
          query($id: ID!) {
            proposal(id: $id) {
              id
              title
              abstract
              status
              proposer{
                id
                firstname
                lastname
              }
              users{
                firstname
                lastname
                username
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

      const data = await sendRequest(query, variables);
      return {
        title: data.proposal.title,
        abstract: data.proposal.abstract,
        id: data.proposal.id,
        status: data.proposal.status,
        proposer: {
          id: data.proposal.proposer.id,
          firstname: data.proposal.proposer.firstname,
          surname: data.proposal.proposer.lastname
        },
        users: data.proposal.users.map((user: any) => {
          return {
            name: user.firstname,
            surname: user.lastname,
            username: user.username,
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
      };
    },
    [sendRequest]
  );

  return { loading, loadProposal };
}
