import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { Proposal } from "../generated/sdk";

export function useProposalData(id: number | null) {
  const sendRequest = useDataApi();
  const [proposalData, setProposalData] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getProposalInformation = (id: number) => {
      sendRequest()
        .getProposal({ id })
        .then(data => {
          setProposalData(data.proposal);
          setLoading(false);
        });
    };
    if (id) {
      getProposalInformation(id);
    }
  }, [id, sendRequest]);

  return { loading, proposalData };
}
