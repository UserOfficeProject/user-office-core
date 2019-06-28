import React, { useState, useEffect } from "react";
import { request } from "graphql-request";
import ProposalContainer from "./ProposalContainer";

export default function ProposalSubmission() {
  const [proposalID, setProposalID] = useState(null);

  const createProposalID = () => {
    const query = `
    mutation{
      createProposal{
       proposal{
        id
      }
        error
      }
    }
    `;

    request("/graphql", query).then(data =>
      setProposalID(data.createProposal.proposal.id)
    );
  };

  useEffect(() => {
    createProposalID();
  }, []);

  if (!proposalID) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={{ id: proposalID }} />;
}
