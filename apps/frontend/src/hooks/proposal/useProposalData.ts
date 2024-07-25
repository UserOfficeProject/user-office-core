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

export function useProposalData(primaryKey: number | null | undefined) {
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    console.log('useProposalData in', primaryKey);

    if (primaryKey) {
      setLoading(true);
      api()
        .getProposal({ primaryKey })
        .then((data) => {
          if (unmounted) {
            return;
          }

          console.log('useProposalData out', primaryKey);

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
