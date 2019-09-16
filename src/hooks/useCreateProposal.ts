import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useCreateProposal() {
  const sendRequest = useDataAPI();
  const [proposalID, setProposalID] = useState(null);

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
  }, [sendRequest]);

  return { proposalID };
}