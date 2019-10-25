import { useEffect, useState } from "react";
import { useDataAPI } from "../hooks/useDataAPI";

export function useProposalsData(filter) {
  const sendRequest = useDataAPI();
  const [proposalsData, setProposalsData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sendAllProposalRequest = filter => {
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
          data.proposals.proposals.map(proposal => {
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
