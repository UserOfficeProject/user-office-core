import { useEffect, useState } from 'react';

import { GetExperimentQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useExperiment(experimentPk: number) {
  const [experiment, setExperiment] = useState<
    GetExperimentQuery['experiment'] | null
  >(null);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getExperiment({ experimentPk })
      .then(({ experiment }) => {
        if (unmounted) {
          return;
        }
        if (experiment) {
          setExperiment(experiment);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, experimentPk]);

  return { experiment, setExperiment };
}
