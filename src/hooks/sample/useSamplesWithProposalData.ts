import { useEffect, useState } from 'react';

import { SamplesFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { SampleCore } from 'models/questionary/sample/SampleCore';

export function useSamples(filter?: SamplesFilter) {
  const [samples, setSamples] = useState<SampleCore[]>([]);

  const [samplesFilter, setSamplesFilter] = useState(filter);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    setLoadingSamples(true);
    api()
      .getSamplesWithQuestionaryStatus({ filter: samplesFilter })
      .then((data) => {
        if (data.samples) {
          setSamples(data.samples);
        }
        setLoadingSamples(false);
      });
  }, [api, samplesFilter]);

  return { samples, loadingSamples, setSamples, setSamplesFilter };
}
