import { useEffect, useState } from 'react';

import { Feature } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFeatures(): {
  loadingFeatures: boolean;
  features: Feature[];
} {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    setLoadingFeatures(true);
    api()
      .getFeatures()
      .then((data) => {
        setFeatures(data.features);
        setLoadingFeatures(false);
      })
      .catch(() => {
        setFeatures([]);
        setLoadingFeatures(false);
      });
  }, [api]);

  return { loadingFeatures, features };
}
