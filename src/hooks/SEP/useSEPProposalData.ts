import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { SepProposal, Proposal } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type SepProposalBasics = Pick<
  SepProposal,
  'proposalId' | 'sepId' | 'sepTimeAllocation' | 'instrumentSubmitted'
> & {
  proposal: Proposal;
};

export function useSEPProposalData(
  sepId: number,
  proposalId?: number | null
): {
  loading: boolean;
  SEPProposalData: SepProposalBasics | null;
  setSEPProposalData: Dispatch<SetStateAction<SepProposalBasics | null>>;
} {
  const api = useDataApi();
  const [
    SEPProposalData,
    setSEPProposalData,
  ] = useState<SepProposalBasics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let unmounted = false;
    setLoading(true);

    if (proposalId && sepId) {
      api()
        .getSEPProposal({ sepId, proposalId })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.sepProposal) {
            setSEPProposalData(data.sepProposal as SepProposalBasics);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      unmounted = true;
    };
  }, [sepId, api, proposalId]);

  return { loading, SEPProposalData, setSEPProposalData };
}
