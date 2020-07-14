import { useEffect, useState } from 'react';

import { Proposal } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useProposalData(id: number | null | undefined) {
  const [proposalData, setProposalData] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    if (id) {
      api()
        .getProposal({ id })
        .then(data => {
          setProposalData(data.proposal as Proposal);
          setLoading(false);
        });
    }
  }, [id, api]);

  return { loading, proposalData };
}
