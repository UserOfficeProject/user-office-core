import { useCallback, useEffect, useState } from 'react';

import { ExperimentsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type QueryParameters = {
  first?: number;
  offset?: number;
  sortField?: string | undefined;
  sortDirection?: string | undefined;
  searchText?: string | undefined;
  refetch?: boolean;
};

export function useAllExperiments(
  filter: ExperimentsFilter,
  queryParameters?: QueryParameters
) {
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  const { callId } = filter;

  const fetchAllExperimentsData = useCallback(
    async (componentController?: { unmounted: boolean }) => {
      setLoading(true);
      api()
        .getExperiments({
          filter: {
            callId,
          },
          ...queryParameters,
        })
        .then(() => {
          if (componentController?.unmounted) {
            return;
          }
          setLoading(false);
        });
    },
    []
  );

  useEffect(() => {
    const componentController = { unmounted: false };
    fetchAllExperimentsData(componentController);

    return () => {
      componentController.unmounted = true;
    };
  }, [fetchAllExperimentsData]);

  return { loading };
}
