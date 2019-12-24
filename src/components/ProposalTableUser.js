import React from "react";
import ProposalTable from "./ProposalTable";
import { useDataAPI } from "../hooks/useDataAPI";
import { timeAgo } from "./../utils/Time";

export default function ProposalTableUser(props) {
  const sendRequest = useDataAPI();

  const sendUserProposalRequest = searchQuery => {
    const query = `
    query($id: Int!) {
      user(id: $id){
        proposals {
          id
          shortCode
          title
          status
          created
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
        data: data.user.proposals
          .sort((a, b) => {
            return (
              new Date(b.created).getTime() - new Date(a.created).getTime()
            );
          })
          .map(proposal => {
            return {
              id: proposal.id,
              title: proposal.title,
              status: proposal.status === 0 ? "Open" : "Submitted",
              shortCode: proposal.shortCode,
              created: timeAgo(proposal.created)
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
