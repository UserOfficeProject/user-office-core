import { useEffect, useState } from "react";
import { useDataAPI } from "./useDataAPI";

export function useProposalsData(filter: string) {
  const sendRequest = useDataAPI();
  const [proposalsData, setProposalsData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sendAllProposalRequest = (filter: string) => {
      const query = `
        query($filter: String!) {
          proposals(filter: $filter) {
            proposals{
              id
              title
              status
              }
            totalCount
            }
          }`;

      const variables = {
        filter: filter
      };
      sendRequest(query, variables).then(data => {
        setProposalsData(
          data.proposals.proposals.map((proposal: any) => {
            return {
              id: proposal.id,
              title: proposal.title,
              status: proposal.status
            };
          })
        );
        setLoading(false);
      });
    };
    sendAllProposalRequest(filter);
  }, [filter, sendRequest]);

  return { loading, proposalsData, setProposalsData };
}

interface ProposalData {
  id: number;
  title: string;
  status: string;
}
