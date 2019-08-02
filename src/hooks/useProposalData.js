import { useEffect, useState } from "react";
import { useDataAPI } from "../hooks/useDataAPI";

export function useProposalData(id) {
  const sendRequest = useDataAPI();
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getProposalInformation = id => {
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
          users: data.proposal.users.map(user => {
            return {
              name: user.firstname,
              surname: user.lastname,
              username: user.username,
              id: user.id
            };
          }),
          reviews: data.proposal.reviews.map(review => {
            return {
              id: review.id,
              grade: review.grade,
              comment: review.comment,
              reviewer: review.reviewer,
              status: review.status
            };
          })
        });
        setLoading(false);
      });
    };
    getProposalInformation(id);
  }, [id, sendRequest]);

  return { loading, proposalData };
}
