import { useEffect, useState } from 'react';

import { GetSamplesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalSamples(proposalId: number | null) {
  const [samples, setSamples] = useState<
    Exclude<GetSamplesQuery['samples'], null>
  >([]);

  const [loadingSamples, setLoadingSamples] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    if (!proposalId) {
      setSamples([]);

      return;
    }
    setLoadingSamples(true);
    api()
      .getSamples({ filter: { proposalId } })
      .then((data) => {
        if (data.samples) {
          setSamples(data.samples);
        }
        setLoadingSamples(false);
      });
  }, [api, proposalId]);

  return { samples, loadingSamples, setSamples };
}
