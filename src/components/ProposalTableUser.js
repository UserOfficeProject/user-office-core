import React from "react";
import { useDataApi2 } from "../hooks/useDataApi2";
import { timeAgo } from "./../utils/Time";
import ProposalTable from "./ProposalTable";

export default function ProposalTableUser(props) {
  const api = useDataApi2();

  const sendUserProposalRequest = searchQuery => {
    return api()
      .getUserProposals({ id: props.id })
      .then(data => {
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
