import { useEffect, useState } from 'react';

import { GetProposalQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type ProposalData = NonNullable<GetProposalQuery['proposal']>;
export type ProposalDataInstrument = NonNullable<
  ProposalData['instruments']
>[0];
export type ProposalDataTechnicalReview = NonNullable<
  ProposalData['technicalReviews']
>[0];

export function useProposalData(
  primaryKey: number | string | null | undefined
) {
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    if (primaryKey) {
      setLoading(true);
      api()
        .getProposal({
          primaryKey:
            typeof primaryKey === 'string' ? parseInt(primaryKey) : primaryKey,
        })
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
  }, [primaryKey, api]);

  return { loading, proposalData, setProposalData };
}
