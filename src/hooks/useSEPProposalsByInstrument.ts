import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { SepProposal } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';

export function useSEPProposalsByInstrument(
  instrumentId: number,
  sepId: number,
  callId: number
): {
  loadingInstrumentProposals: boolean;
  instrumentProposalsData: SepProposal[];
  setInstrumentProposalsData: Dispatch<SetStateAction<SepProposal[]>>;
} {
  const [instrumentProposalsData, setInstrumentProposalsData] = useState<
    SepProposal[]
  >([]);
  const [loadingInstrumentProposals, setLoadingInstrumentProposals] = useState(
    true
  );

  const api = useDataApi();

  useEffect(() => {
    setLoadingInstrumentProposals(true);
    api()
      .sepProposalsByInstrument({ instrumentId, sepId, callId })
      .then(data => {
        if (data.sepProposalsByInstrument) {
          setInstrumentProposalsData(
            data.sepProposalsByInstrument as SepProposal[]
          );
        }
        setLoadingInstrumentProposals(false);
      });
  }, [api, sepId, instrumentId, callId]);

  return {
    loadingInstrumentProposals,
    instrumentProposalsData,
    setInstrumentProposalsData,
  };
}
