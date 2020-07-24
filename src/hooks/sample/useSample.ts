import { GetSampleQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useEffect, useState } from 'react';

export function useSample(sampleId: number) {
  const [sample, setSample] = useState<GetSampleQuery['sample']>(null);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getSample({ sampleId })
      .then(data => {
        if (data.sample) {
          setSample(data.sample);
        }
      });
  }, [api, sampleId]);

  return { sample };
}
