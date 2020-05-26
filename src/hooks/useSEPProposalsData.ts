import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { GetSepProposalsQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPProposalsData(
  sepId: number
): {
  loadingSEPProposals: boolean;
  SEPProposalsData: GetSepProposalsQuery['sepProposals'] | null;
  setSEPProposalsData: Dispatch<
    SetStateAction<GetSepProposalsQuery['sepProposals'] | null>
  >;
} {
  const api = useDataApi();
  const [SEPProposalsData, setSEPProposalsData] = useState<
    GetSepProposalsQuery['sepProposals'] | null
  >([]);
  const [loadingSEPProposals, setLoadingSEPProposals] = useState(true);
  useEffect(() => {
    api()
      .getSEPProposals({ sepId })
      .then(data => {
        setSEPProposalsData(data.sepProposals);
        setLoadingSEPProposals(false);
      });
  }, [sepId, api]);

  return { loadingSEPProposals, SEPProposalsData, setSEPProposalsData };
}
