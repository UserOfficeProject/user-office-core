import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { SepProposal } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPProposalsByInstrument(
  instrumentId: number,
  sepId: number
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
      .sepProposalsByInstrument({ instrumentId, sepId })
      .then(data => {
        if (data.sepProposalsByInstrument) {
          setInstrumentProposalsData(
            data.sepProposalsByInstrument as SepProposal[]
          );
        }
        setLoadingInstrumentProposals(false);
      });
  }, [api, sepId, instrumentId]);

  return {
    loadingInstrumentProposals,
    instrumentProposalsData,
    setInstrumentProposalsData,
  };
}
