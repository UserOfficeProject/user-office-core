import { useEffect, useState } from "react";
import { useDataApi } from "./useDataApi";
import { ProposalStatus } from "../generated/sdk";

export function useProposalsData(filter: string) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalData[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sendAllProposalRequest = (filter: string) => {
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
    };
    sendAllProposalRequest(filter);
  }, [filter, api]);

  return { loading, proposalsData, setProposalsData };
}

interface ProposalData {
  id: number;
  title: string;
  status: string;
}
