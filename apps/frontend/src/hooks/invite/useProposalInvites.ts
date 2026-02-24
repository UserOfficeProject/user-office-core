import { useEffect, useState } from 'react';

import { GetCoProposerInvitesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalInvites() {
  const [proposalInvites, setProposalInvites] = useState<
    NonNullable<GetCoProposerInvitesQuery['me']>['coProposerInvites']
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingInviteId, setProcessingInviteId] = useState<number | null>(
    null
  );

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getCoProposerInvites()
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.me) setProposalInvites(data.me.coProposerInvites);
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  const acceptCoProposerInvite = (inviteId: number) => {
    const proposalId = proposalInvites.find((invite) => invite.id === inviteId)
      ?.proposal?.proposalId;
    if (!proposalId) {
      throw new Error('Failed to accept the invitation.');
    }
    setProcessingInviteId(inviteId);
    api()
      .acceptCoProposerInvite({ proposalId })
      .then(({ acceptCoProposerInvite }) => {
        setProposalInvites((invites) =>
          invites.filter((invite) => invite.id !== acceptCoProposerInvite.id)
        );
      })
      .catch(() => {
        throw new Error('Failed to accept the invitation.');
      })
      .finally(() => {
        setProcessingInviteId(null);
      });
  };

  return {
    loading,
    proposalInvites,
    acceptCoProposerInvite,
    processingInviteId,
  };
}
