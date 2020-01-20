import { useEffect, useState } from "react";
import { useDataApi2 } from "./useDataApi2";
import { Proposal } from "../generated/sdk";

export function useProposalData(id: number | null) {
  const sendRequest = useDataApi2();
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
