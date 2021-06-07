import { useEffect, useState } from 'react';

import { GetProposalQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalData(id: number | null | undefined) {
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    if (id) {
      setLoading(true);
      api()
        .getProposal({ id })
        .then((data) => {
          if (unmounted) {
            return;
          }

          setProposalData(data.proposal);
          setLoading(false);
        });
    }

    return () => {
      unmounted = true;
    };
  }, [id, api]);

  return { loading, proposalData, setProposalData };
}

export type ProposalData = Exclude<GetProposalQuery['proposal'], null>;
