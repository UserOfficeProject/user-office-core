import React, { useState, useEffect } from "react";
import ProposalContainer from "./ProposalContainer";
import { useDataAPI } from "./UserContextProvider";

export default function ProposalSubmission() {
  const [proposalID, setProposalID] = useState(null);
  const [sendRequest] = useDataAPI();

  useEffect(() => {
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
    sendRequest(query).then(data =>
      setProposalID(data.createProposal.proposal.id)
    );
  }, []);

  if (!proposalID) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={{ id: proposalID }} />;
}
