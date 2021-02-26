import { useEffect, useState } from 'react';

import { GetSamplesQuery, SamplesFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useSamples(filter?: SamplesFilter) {
  const [samples, setSamples] = useState<
    Exclude<GetSamplesQuery['samples'], null>
  >([]);

  const [samplesFilter, setSamplesFilter] = useState(filter);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    setLoadingSamples(true);
    api()
      .getSamples({ filter: samplesFilter })
      .then((data) => {
        if (data.samples) {
          setSamples(data.samples);
        }
        setLoadingSamples(false);
      });
  }, [api, samplesFilter]);

  return { samples, loadingSamples, setSamples, setSamplesFilter };
}
