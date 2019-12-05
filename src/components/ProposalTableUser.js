import React from "react";
import ProposalTable from "./ProposalTable";
import { useDataAPI } from "../hooks/useDataAPI";
import { timeAgo } from "./../utils/Time";

export default function ProposalTableUser(props) {
  const sendRequest = useDataAPI();

  const sendUserProposalRequest = searchQuery => {
    const query = `
    query($id: ID!) {
      user(id: $id){
        proposals {
          id
          shortCode
          title
          status
          updated
        }
      }
    }`;

    const variables = {
      id: props.id
    };
    return sendRequest(query, variables).then(data => {
      return {
        page: 0,
        totalCount: data.user.proposals.length,
        data: data.user.proposals.map(proposal => {
          return {
            id: proposal.id,
            title: proposal.title,
            status: proposal.status === 0 ? "Open" : "Submitted",
            shortCode: proposal.shortCode,
            updated: timeAgo(proposal.updated)
          };
        })
      };
    });
  };

  return (
    <ProposalTable
      title="Your proposals"
      search={false}
      searchQuery={sendUserProposalRequest}
    />
  );
}
