import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { SepProposal } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';

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
    api()
      .getSEPProposals({ sepId, callId })
      .then(data => {
        setSEPProposalsData(data.sepProposals as SepProposal[]);
        setLoadingSEPProposals(false);
      });
  }, [sepId, api, callId]);

  return { loadingSEPProposals, SEPProposalsData, setSEPProposalsData };
}
