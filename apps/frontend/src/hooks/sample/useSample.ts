import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { SampleFragment } from './../../generated/sdk';

export function useSample(sampleId: number) {
  const [sample, setSample] = useState<SampleFragment | null>(null);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getSample({ sampleId })
      .then((data) => {
        if (data.sample) {
          setSample(data.sample);
        }
      });
  }, [api, sampleId]);

  return { sample };
}
