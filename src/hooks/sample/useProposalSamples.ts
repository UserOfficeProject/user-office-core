import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { SampleWithQuestionaryStatus } from 'models/Sample';

export function useProposalSamples(proposalPk: number | null) {
  const [samples, setSamples] = useState<SampleWithQuestionaryStatus[]>([]);

  const [loadingSamples, setLoadingSamples] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    if (!proposalPk) {
      setSamples([]);

      return;
    }
    setLoadingSamples(true);
    api()
      .getSamplesWithQuestionaryStatus({ filter: { proposalPk } })
      .then((data) => {
        if (data.samples) {
          setSamples(data.samples);
        }
        setLoadingSamples(false);
      });
  }, [api, proposalPk]);

  return { samples, loadingSamples, setSamples };
}
