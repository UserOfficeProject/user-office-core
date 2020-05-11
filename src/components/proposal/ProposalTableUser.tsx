import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { ProposalStatus } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { timeAgo } from '../../utils/Time';
import ProposalTable from './ProposalTable';

export type PartialProposalsDataType = {
  id: number;
  title: string;
  status: string;
  shortCode: string;
  created: string | null;
};

export type UserProposalDataType = {
  page: number;
  totalCount: number | undefined;
  data: PartialProposalsDataType[] | undefined;
};

type ProposalTableUserProps = {
  id: number;
};

const ProposalTableUser: React.FC<ProposalTableUserProps> = ({ id }) => {
  const api = useDataApi();

  const sendUserProposalRequest = useCallback(async () => {
    return api()
      .getUserProposals({ id })
      .then(data => {
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
  }, [api, id]);

  return (
    <ProposalTable
      title="Your proposals"
      search={false}
      searchQuery={sendUserProposalRequest}
    />
  );
};

ProposalTableUser.propTypes = {
  id: PropTypes.number.isRequired,
};

export default ProposalTableUser;
