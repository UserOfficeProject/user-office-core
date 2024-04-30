import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { SepProposal } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useSEPProposalsByInstrument(
  instrumentId: number,
  sepId: number,
  callId?: number
): {
  loadingInstrumentProposals: boolean;
  instrumentProposalsData: SepProposal[];
  setInstrumentProposalsData: Dispatch<SetStateAction<SepProposal[]>>;
  refreshInstrumentProposalsData: () => void;
} {
  const [instrumentProposalsData, setInstrumentProposalsData] = useState<
    SepProposal[]
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
    api()
      .sepProposalsByInstrument({ instrumentId, sepId, callId })
      .then((data) => {
        if (canceled) {
          return;
        }

        if (data.sepProposalsByInstrument) {
          setInstrumentProposalsData(
            data.sepProposalsByInstrument as SepProposal[]
          );
        }
        setLoadingInstrumentProposals(false);
      });

    return () => {
      canceled = true;
    };
  }, [api, sepId, instrumentId, callId, refreshCounter]);

  return {
    loadingInstrumentProposals,
    instrumentProposalsData,
    setInstrumentProposalsData,
    refreshInstrumentProposalsData,
  };
}
