import { useEffect, useState } from 'react';

import { Feature } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFeatures(): {
  loadingFeatures: boolean;
  features: Feature[];
  setFeatures: React.Dispatch<React.SetStateAction<Feature[]>>;
} {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingFeatures(true);
    api()
      .getFeatures()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setFeatures(data.features);
        setLoadingFeatures(false);
      })
      .catch(() => {
        setFeatures([]);
        setLoadingFeatures(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return { loadingFeatures, features, setFeatures };
}
