import React from "react";
import ProposalTable from "./ProposalTable";
import { useDataAPI } from "../hooks/useDataAPI";

export default function ProposalTableOfficer() {
  const sendRequest = useDataAPI();

  const sendAllProposalRequest = searchQuery => {
    const query = `
    query($filter: String!, $first: Int!, $offset: Int!) {
      proposals(filter: $filter, first: $first, offset: $offset) {
        proposals{
          id
          title
          status
          }
        totalCount
        }
      }`;

    const variables = {
      filter: searchQuery.search,
      offset: searchQuery.pageSize * searchQuery.page,
      first: searchQuery.pageSize
    };
    return sendRequest(query, variables).then(data => {
      return {
        page: searchQuery.page,
        totalCount: data.proposals.totalCount,
        data: data.proposals.proposals.map(proposal => {
          return {
            id: proposal.id,
            title: proposal.title,
            status: proposal.status
          };
        })
      };
    });
  };

  return (
    <ProposalTable
      title="Proposals"
      search={true}
      searchQuery={sendAllProposalRequest}
    />
  );
}
