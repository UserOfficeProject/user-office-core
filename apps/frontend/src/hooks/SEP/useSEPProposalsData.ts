import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { GetSepProposalsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { Unpacked } from 'utils/utilTypes';

export type SEPProposalType = Unpacked<
  NonNullable<GetSepProposalsQuery['sepProposals']>
>;

export type SEPProposalAssignmentType = Unpacked<
  NonNullable<SEPProposalType['assignments']>
>;

export function useSEPProposalsData(
  sepId: number,
  callId: number | null
): {
  loadingSEPProposals: boolean;
  SEPProposalsData: SEPProposalType[];
  setSEPProposalsData: Dispatch<SetStateAction<SEPProposalType[]>>;
} {
  const api = useDataApi();
  const [SEPProposalsData, setSEPProposalsData] = useState<SEPProposalType[]>(
    []
  );
  const [loadingSEPProposals, setLoadingSEPProposals] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoadingSEPProposals(true);
    api()
      .getSEPProposals({ sepId, callId })
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (data.sepProposals) {
          setSEPProposalsData(data.sepProposals);
        }
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
