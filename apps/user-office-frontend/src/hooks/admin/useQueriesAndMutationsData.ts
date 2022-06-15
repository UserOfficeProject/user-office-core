import { useEffect, useState } from 'react';

import { QueriesAndMutations } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useQueriesAndMutationsData(): {
  loadingQueriesAndMutations: boolean;
  queriesAndMutations: QueriesAndMutations;
} {
  const [queriesAndMutations, setQueriesAndMutations] =
    useState<QueriesAndMutations>({ queries: [], mutations: [] });
  const [loadingQueriesAndMutations, setLoadingQueriesAndMutations] =
    useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingQueriesAndMutations(true);
    api()
      .getAllQueriesAndMutations()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setQueriesAndMutations(data.queriesAndMutations as QueriesAndMutations);
        setLoadingQueriesAndMutations(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api]);

  return { loadingQueriesAndMutations, queriesAndMutations };
}
