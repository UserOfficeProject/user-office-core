import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { GetFapProposalQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type FapProposalBasics = GetFapProposalQuery['fapProposal'];

export function useFapProposalData(
  fapId: number,
  proposalPk?: number | null
): {
  loading: boolean;
  FapProposalData: FapProposalBasics | null;
  setFapProposalData: Dispatch<SetStateAction<FapProposalBasics | null>>;
} {
  const api = useDataApi();
  const [FapProposalData, setFapProposalData] =
    useState<FapProposalBasics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let unmounted = false;
    setLoading(true);

    if (proposalPk && fapId) {
      api()
        .getFapProposal({ fapId, proposalPk })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.fapProposal) {
            setFapProposalData(data.fapProposal as FapProposalBasics);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      unmounted = true;
    };
  }, [fapId, api, proposalPk]);

  return { loading, FapProposalData, setFapProposalData };
}
