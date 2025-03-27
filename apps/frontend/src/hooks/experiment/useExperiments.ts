import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import {
  GetExperimentsQuery,
  GetExperimentsQueryVariables,
} from '../../generated/sdk';

export function useExperiments(queryArgs: GetExperimentsQueryVariables) {
  const [args, setArgs] = useState(queryArgs);
  const [experiments, setExperiments] = useState<
    GetExperimentsQuery['experiments']
  >([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingEvents(true);
    api()
      .getExperiments(args)
      .then(({ experiments }) => {
        if (unmounted) {
          return;
        }
        if (experiments) {
          setExperiments(experiments);
        }
        setLoadingEvents(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, args]);

  return { experiments, setExperiments, setArgs, loadingEvents };
}
