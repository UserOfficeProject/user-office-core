import { useEffect, useState } from 'react';

import { QueriesMutationsAndServices } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useQueriesMutationsAndServicesData(): {
  loadingQueriesMutationsAndServices: boolean;
  queriesMutationsAndServices: QueriesMutationsAndServices;
} {
  const [queriesMutationsAndServices, setQueriesMutationsAndServices] =
    useState<QueriesMutationsAndServices>({
      queries: [],
      mutations: [],
      services: [],
    });
  const [
    loadingQueriesMutationsAndServices,
    setLoadingQueriesMutationsAndServices,
  ] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingQueriesMutationsAndServices(true);
    api()
      .getAllQueriesMutationsAndServices()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setQueriesMutationsAndServices(
          data.queriesMutationsAndServices as QueriesMutationsAndServices
        );
        setLoadingQueriesMutationsAndServices(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api]);

  return { loadingQueriesMutationsAndServices, queriesMutationsAndServices };
}
