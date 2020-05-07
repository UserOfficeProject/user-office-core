import React from 'react';

import { ProposalStatus } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { timeAgo } from '../../utils/Time';
import ProposalTable from './ProposalTable';

export default function ProposalTableUser(props) {
  const api = useDataApi();

  const sendUserProposalRequest = searchQuery => {
    return api()
      .getUserProposals({ id: props.id })
      .then(data => {
        return {
          page: 0,
          totalCount: data.me.proposals.length,
          data: data.me.proposals
            .sort((a, b) => {
              return (
                new Date(b.created).getTime() - new Date(a.created).getTime()
              );
            })
            .map(proposal => {
              return {
                id: proposal.id,
                title: proposal.title,
                status:
                  proposal.status === ProposalStatus.DRAFT
                    ? 'Open'
                    : 'Submitted',
                shortCode: proposal.shortCode,
                created: timeAgo(proposal.created),
              };
            }),
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
