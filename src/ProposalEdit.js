import React, { useState, useEffect } from "react";
import ProposalContainer from "./ProposalContainer";
import { useDataAPI } from "./UserContextProvider";

export default function ProposalEdit({ match }) {
  const [proposalData, setProposalData] = useState({});
  const [loading, setLoading] = useState(true);
  const sendRequest = useDataAPI();

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
          })
        });
        setLoading(false);
      });
    };
    getProposalInformation(match.params.proposalID);
  }, [match.params.proposalID]);

  if (loading) {
    return <p>Loading</p>;
  }
  return <ProposalContainer data={proposalData} />;
}
