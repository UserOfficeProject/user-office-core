import { useEffect, useState } from 'react';

import { Proposal } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUserProposals() {
  const [proposals, setProposals] = useState<
    Pick<
      Proposal,
      | 'id'
      | 'shortCode'
      | 'title'
      | 'publicStatus'
      | 'statusId'
      | 'created'
      | 'finalStatus'
      | 'notified'
      | 'submitted'
    >[]
  >([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    setLoadingProposals(true);
    api()
      .getUserProposals()
      .then(data => {
        if (data.me) {
          setProposals(data.me.proposals);
        }
        setLoadingProposals(false);
      });
  }, [api]);

  return { loadingProposals, proposals, setProposals };
}
