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
  instrumentId: number | null
): {
  loadingFapProposals: boolean;
  FapProposalsData: FapProposalType[];
  setFapProposalsData: Dispatch<SetStateAction<FapProposalType[]>>;
} {
  const api = useDataApi();
  const [FapProposalsData, setFapProposalsData] = useState<FapProposalType[]>(
    []
  );
  const [loadingFapProposals, setLoadingFapProposals] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoadingFapProposals(true);
    api()
      .getFapProposals({ fapId, callId, instrumentId })
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (data.fapProposals) {
          setFapProposalsData(data.fapProposals);
        }
        setLoadingFapProposals(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fapId, api, callId, instrumentId]);

  return {
    loadingFapProposals,
    FapProposalsData,
    setFapProposalsData,
  } as const;
}
