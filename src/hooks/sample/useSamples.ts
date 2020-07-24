import { GetSamplesQuery, SamplesFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useEffect, useState } from 'react';

export function useSamples(filter: SamplesFilter) {
  const [samples, setSamples] = useState<
    Exclude<GetSamplesQuery['samples'], null>
  >([]);

  const [samplesFilter, setSamplesFilter] = useState(filter);
  const api = useDataApi();

  useEffect(() => {
    api()
      .getSamples({ filter: samplesFilter })
      .then(data => {
        if (data.samples) {
          setSamples(data.samples);
        }
      });
  }, [api, samplesFilter]);

  return { samples, setSamplesFilter };
}
