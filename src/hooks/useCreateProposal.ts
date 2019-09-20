import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";
import { ProposalData } from "../model/ProposalModel";

export function useCreateProposal() {
  const sendRequest = useDataAPI();
  const [proposal, setProposal] = useState<ProposalData|null>(null);

  useEffect(() => {
    const query = `
      mutation{
        createProposal{
         proposal{
          id
          status
        }
          error
        }
      }
      `;
    sendRequest(query).then(data =>
      setProposal(data.createProposal.proposal)
    );
  }, [sendRequest]);

  return { proposal };
}