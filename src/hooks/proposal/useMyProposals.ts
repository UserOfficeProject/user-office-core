import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { ProposalFragment, UserProposalsFilter } from './../../generated/sdk';

export function useMyProposals(filter: UserProposalsFilter) {
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [proposals, setProposals] = useState<ProposalFragment[]>([]);
  const [proposalFilter, setProposalFilter] = useState<UserProposalsFilter>(
    filter
  );

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingProposals(true);

    api()
      .getMyProposals({ filter: proposalFilter })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.me) {
          setProposals(data.me.proposals);
        }
        setLoadingProposals(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, proposalFilter]);

  return { loadingProposals, proposals, setProposals, setProposalFilter };
}
