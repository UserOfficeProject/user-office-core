import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { GetFapProposalsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { Unpacked } from 'utils/utilTypes';

export type FapProposalType = Unpacked<
  NonNullable<GetFapProposalsQuery['fapProposals']>
>;

export type FapProposalAssignmentType = Unpacked<
  NonNullable<FapProposalType['assignments']>
>;

export function useFapProposalsData(
  fapId: number,
  callId: number | null,
  first: number | null,
  offset: number | null
): {
  loadingFapProposals: boolean;
  FapProposalsData: FapProposalType[];
  setFapProposalsData: Dispatch<SetStateAction<FapProposalType[]>>;
  totalCount: number;
} {
  const api = useDataApi();
  const [FapProposalsData, setFapProposalsData] = useState<FapProposalType[]>(
    []
  );
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loadingFapProposals, setLoadingFapProposals] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoadingFapProposals(true);
    api()
      .getFapProposals({ fapId, callId, first, offset })
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (data.fapProposals) {
          setFapProposalsData(data.fapProposals);
        }
        if (data.fapProposalsCount) {
          setTotalCount(data.fapProposalsCount);
        }
        setLoadingFapProposals(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fapId, api, callId, first, offset]);

  return {
    loadingFapProposals,
    FapProposalsData,
    setFapProposalsData,
    totalCount,
  } as const;
}
