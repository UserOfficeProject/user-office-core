import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { SepProposal } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useSEPProposalsData(
  sepId: number,
  callId: number
): {
  loadingSEPProposals: boolean;
  SEPProposalsData: SepProposal[] | null;
  setSEPProposalsData: Dispatch<SetStateAction<SepProposal[] | null>>;
} {
  const api = useDataApi();
  const [SEPProposalsData, setSEPProposalsData] = useState<
    SepProposal[] | null
  >([]);
  const [loadingSEPProposals, setLoadingSEPProposals] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoadingSEPProposals(true);
    api()
      .getSEPProposals({ sepId, callId })
      .then(data => {
        if (cancelled) {
          return;
        }

        setSEPProposalsData(data.sepProposals as SepProposal[]);
        setLoadingSEPProposals(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sepId, api, callId]);

  return {
    loadingSEPProposals,
    SEPProposalsData,
    setSEPProposalsData,
  } as const;
}
