import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { SampleWithQuestionaryStatus } from 'models/Sample';

export function useProposalSamples(proposalId: number | null) {
  const [samples, setSamples] = useState<SampleWithQuestionaryStatus[]>([]);

  const [loadingSamples, setLoadingSamples] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    if (!proposalId) {
      setSamples([]);

      return;
    }
    setLoadingSamples(true);
    api()
      .getSamplesWithQuestionaryStatus({ filter: { proposalId } })
      .then((data) => {
        if (data.samples) {
          setSamples(data.samples);
        }
        setLoadingSamples(false);
      });
  }, [api, proposalId]);

  return { samples, loadingSamples, setSamples };
}
