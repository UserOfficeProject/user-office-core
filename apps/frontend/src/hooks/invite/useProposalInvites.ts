import { useEffect, useState } from 'react';

import { GetProposalInvitesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalInvites() {
  const [proposalInvites, setProposalInvites] = useState<
    NonNullable<GetProposalInvitesQuery['me']>['proposalInvites']
  >([]);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getProposalInvites()
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.me) setProposalInvites(data.me.proposalInvites);
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  const acceptInvite = () => {};
  const declineInvite = () => {};

  return {
    loading,
    proposalInvites,
    setProposalInvites,
    acceptInvite,
    declineInvite,
  };
}
