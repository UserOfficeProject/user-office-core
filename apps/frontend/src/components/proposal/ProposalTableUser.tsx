import React, { useCallback, useState } from 'react';

import ProposalInviteNotification from 'components/proposal/ProposalInviteNotification';
import { Call, Maybe, ProposalPublicStatus, Status } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import ProposalTable from './ProposalTable';

export type PartialProposalsDataType = {
  primaryKey: number;
  title: string;
  status: Maybe<Status>;
  publicStatus: ProposalPublicStatus;
  finalStatus?: string;
  notified?: boolean;
  submitted: boolean;
  proposalId: string;
  created: string | null;
  call?: Maybe<
    Pick<
      Call,
      | 'shortCode'
      | 'id'
      | 'isActive'
      | 'isActiveInternal'
      | 'referenceNumberFormat'
      | 'startCall'
      | 'endCall'
      | 'endCallInternal'
    >
  >;
  proposerId?: number;
};

export type UserProposalDataType = {
  page: number;
  totalCount: number | undefined;
  data: PartialProposalsDataType[] | undefined;
};

const ProposalTableUser = () => {
  const api = useDataApi();
  const [refreshTableKey, setRefreshTableKey] = useState(0);
  const sendUserProposalRequest = useCallback(
    async (page: number, pageSize: number) => {
      return api()
        .getUserProposals({ first: pageSize, offset: page * pageSize })
        .then((data) => {
          return {
            page,
            totalCount: data?.me?.paginatedProposals?.totalCount,
            data: data?.me?.paginatedProposals?.userProposals
              .sort((a, b) => {
                return (
                  new Date(b.created).getTime() - new Date(a.created).getTime()
                );
              })
              .map((proposal) => {
                const hasReferenceNumberFormat =
                  !!proposal.call?.referenceNumberFormat;

                return {
                  primaryKey: proposal.primaryKey,
                  title: proposal.title,
                  status: proposal.status,
                  publicStatus: proposal.publicStatus,
                  submitted: proposal.submitted,
                  proposalId:
                    !proposal.submitted && hasReferenceNumberFormat
                      ? `* ${proposal.proposalId}`
                      : proposal.proposalId,
                  created: proposal.created,
                  notified: proposal.notified,
                  proposerId: proposal.proposer?.id,
                  call: proposal.call,
                };
              }),
          };
        });
    },
    [api]
  );

  return (
    <>
      <ProposalInviteNotification
        onAccept={() => setRefreshTableKey((prev) => prev + 1)}
      />
      <ProposalTable
        title="Proposals"
        search={false}
        searchQuery={sendUserProposalRequest}
        key={refreshTableKey}
      />
    </>
  );
};

export default ProposalTableUser;
