import { useEffect, useState } from 'react';

import {
  GetCoProposerInvitesQuery,
  GetPendingDataAccessInvitesQuery,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalInvites() {
  const [proposalInvites, setProposalInvites] = useState<
    NonNullable<GetCoProposerInvitesQuery['me']>['coProposerInvites']
  >([]);
  const [dataAccessInvites, setDataAccessInvites] = useState<
    NonNullable<GetPendingDataAccessInvitesQuery['me']>['dataAccessInvites']
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingInviteId, setProcessingInviteId] = useState<number | null>(
    null
  );

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    Promise.all([
      api().getCoProposerInvites(),
      api().getPendingDataAccessInvites(),
    ]).then(([coProposerData, dataAccessData]) => {
      if (unmounted) {
        return;
      }
      if (coProposerData.me)
        setProposalInvites(coProposerData.me.coProposerInvites);
      if (dataAccessData.me)
        setDataAccessInvites(dataAccessData.me.dataAccessInvites);
      setLoading(false);
    });

    return () => {
      unmounted = true;
    };
  }, [api]);

  const acceptCoProposerInvite = async (inviteId: number) => {
    const proposalId = proposalInvites.find((invite) => invite.id === inviteId)
      ?.proposal?.proposalId;
    if (!proposalId) {
      throw new Error('Failed to accept the invitation.');
    }
    setProcessingInviteId(inviteId);
    try {
      const { acceptCoProposerInvite: accepted } =
        await api().acceptCoProposerInvite({ proposalId });

      setProposalInvites((invites) =>
        invites.filter((invite) => invite.id !== accepted.id)
      );
    } finally {
      setProcessingInviteId(null);
    }
  };

  const acceptDataAccessInvite = async (inviteId: number) => {
    const proposalId = dataAccessInvites.find(
      (invite) => invite.id === inviteId
    )?.proposal?.proposalId;
    if (!proposalId) {
      throw new Error('Failed to accept the invitation.');
    }
    setProcessingInviteId(inviteId);
    try {
      const { acceptDataAccessInvite: accepted } =
        await api().acceptDataAccessInvite({ proposalId });

      setDataAccessInvites((invites) =>
        invites.filter((invite) => invite.id !== accepted.id)
      );
    } finally {
      setProcessingInviteId(null);
    }
  };

  return {
    loading,
    proposalInvites,
    dataAccessInvites,
    acceptCoProposerInvite,
    acceptDataAccessInvite,
    processingInviteId,
  };
}
