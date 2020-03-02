import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { ProposalStatus } from "../generated/sdk";
import { Proposal } from "../generated/sdk";

export function useProposalsData(filter: string) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api()
      .getProposals({
        filter: filter
      })
      .then(data => {
        if (data.proposals) {
          setProposalsData(
            data.proposals.proposals.map(proposal => {
              return {
                ...proposal,
                status:
                  proposal.status === ProposalStatus.DRAFT
                    ? "Open"
                    : "Submitted"
              };
            })
          );
        }
        setLoading(false);
      });
  }, [filter, api]);

  return { loading, proposalsData, setProposalsData };
}

interface ProposalData extends Omit<Proposal, "status" | "questionary"> {
  status: string;
}
