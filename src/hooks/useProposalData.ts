import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { Proposal } from "../generated/sdk";

export function useProposalData(id: number | null) {
  const [proposalData, setProposalData] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    if (id) {
      api()
        .getProposal({ id })
        .then(data => {
          setProposalData(data.proposal);
          setLoading(false);
        });
    }
  }, [id, api]);

  return { loading, proposalData };
}
