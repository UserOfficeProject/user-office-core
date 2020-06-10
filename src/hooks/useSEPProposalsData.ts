import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { SepProposal } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPProposalsData(
  sepId: number
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
      .getSEPProposals({ sepId })
      .then(data => {
        setSEPProposalsData(data.sepProposals as SepProposal[]);
        setLoadingSEPProposals(false);
      });
  }, [sepId, api]);

  return { loadingSEPProposals, SEPProposalsData, setSEPProposalsData };
}
