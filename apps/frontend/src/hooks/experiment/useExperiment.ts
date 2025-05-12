import { useEffect, useState } from 'react';

import { GetExperimentQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useExperiment(experimentPk: number) {
  const [experiment, setExperiment] = useState<
    GetExperimentQuery['experiment'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    setLoading(true);
    api()
      .getExperiment({ experimentPk })
      .then(({ experiment }) => {
        if (unmounted) {
          return;
        }
        if (experiment) {
          setExperiment(experiment);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, experimentPk]);

  return { experiment, setExperiment, loading };
}
