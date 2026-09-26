import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { FapProposal } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFapProposalsByInstrument(
  instrumentId: number,
  fapId: number,
  callId?: number
): {
  loadingInstrumentProposals: boolean;
  instrumentProposalsData: FapProposal[];
  setInstrumentProposalsData: Dispatch<SetStateAction<FapProposal[]>>;
  refreshInstrumentProposalsData: () => void;
} {
  const [instrumentProposalsData, setInstrumentProposalsData] = useState<
    FapProposal[]
  >([]);
  const [loadingInstrumentProposals, setLoadingInstrumentProposals] =
    useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const api = useDataApi();

  const refreshInstrumentProposalsData = () =>
    setRefreshCounter(refreshCounter + 1);

  useEffect(() => {
    if (!callId) {
      return;
    }

    let canceled = false;
    setLoadingInstrumentProposals(true);
    const legacy = false;
    api()
      .getFapProposals({ fapId, callId, instrumentId, legacy })
      .then((data) => {
        if (canceled) {
          return;
        }

        if (data.fapProposals) {
          setInstrumentProposalsData(data.fapProposals as FapProposal[]);
        }
        setLoadingInstrumentProposals(false);
      });

    return () => {
      canceled = true;
    };
  }, [api, fapId, instrumentId, callId, refreshCounter]);

  return {
    loadingInstrumentProposals,
    instrumentProposalsData,
    setInstrumentProposalsData,
    refreshInstrumentProposalsData,
  };
}
