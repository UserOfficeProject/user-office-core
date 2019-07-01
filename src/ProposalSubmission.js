import React, { useState, useEffect, useContext } from "react";
import ProposalContainer from "./ProposalContainer";
import { AppContext } from "./App";

export default function ProposalSubmission() {
  const [proposalID, setProposalID] = useState(null);
  const { apiCall } = useContext(AppContext);

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

    apiCall(query).then(data => setProposalID(data.createProposal.proposal.id));
  };

  useEffect(() => {
    createProposalID();
  }, []);

  if (!proposalID) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={{ id: proposalID }} />;
}
