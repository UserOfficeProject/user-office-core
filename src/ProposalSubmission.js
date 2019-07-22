import React, { useState, useEffect, useContext } from "react";
import ProposalContainer from "./ProposalContainer";
import { UserContext } from "./UserContextProvider";

export default function ProposalSubmission() {
  const [proposalID, setProposalID] = useState(null);
  const { apiCall } = useContext(UserContext);

  useEffect(() => {
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

      apiCall(query).then(data =>
        setProposalID(data.createProposal.proposal.id)
      );
    };
    createProposalID();
  }, [apiCall]);

  if (!proposalID) {
    return <p>Loading</p>;
  }

  return <ProposalContainer data={{ id: proposalID }} />;
}
