import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import React, { useCallback, useState } from 'react';

import {
  ProposalEndStatus,
  ProposalPublicStatus,
  ProposalStatus,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { timeAgo } from 'utils/Time';

import ProposalTable from './ProposalTable';

export type PartialProposalsDataType = {
  id: number;
  title: string;
  status: string | null;
  publicStatus: ProposalPublicStatus;
  finalStatus?: string;
  notified?: boolean;
  submitted: boolean;
  shortCode: string;
  created: string | null;
  proposerId?: number;
};

export type UserProposalDataType = {
  page: number;
  totalCount: number | undefined;
  data: PartialProposalsDataType[] | undefined;
};

const ProposalTableUser: React.FC = () => {
  const api = useDataApi();
  const [loading, setLoading] = useState<boolean>(false);
  const getProposalStatus = (proposal: {
    status: ProposalStatus | null;
    finalStatus?: ProposalEndStatus | null | undefined;
    notified: boolean;
  }): string | null => {
    if (proposal.notified) {
      return getTranslation(proposal.finalStatus as ResourceId);
    } else {
      return proposal.status?.name || null;
    }
  };

  const sendUserProposalRequest = useCallback(async () => {
    setLoading(true);

    return api()
      .getUserProposals()
      .then(data => {
        setLoading(false);

        return {
          page: 0,
          totalCount: data?.me?.proposals.length,
          data: data?.me?.proposals
            .sort((a, b) => {
              return (
                new Date(b.created).getTime() - new Date(a.created).getTime()
              );
            })
            .map(proposal => {
              return {
                id: proposal.id,
                title: proposal.title,
                status: getProposalStatus(proposal),
                publicStatus: proposal.publicStatus,
                submitted: proposal.submitted,
                shortCode: proposal.shortCode,
                created: timeAgo(proposal.created),
                notified: proposal.notified,
                proposerId: proposal.proposer?.id,
              };
            }),
        };
      });
  }, [api]);

  return (
    <ProposalTable
      title="My proposals"
      search={false}
      searchQuery={sendUserProposalRequest}
      isLoading={loading}
    />
  );
};

export default ProposalTableUser;
