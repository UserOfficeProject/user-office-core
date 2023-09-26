import { useEffect, useState } from 'react';

import { Quantity } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useQuantities(): {
  loadingQuantities: boolean;
  quantities: Quantity[];
} {
  const [quantities, setQuantities] = useState<Quantity[]>([]);
  const [loadingQuantities, setLoadingQuantities] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingQuantities(true);
    api()
      .getQuantities()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setQuantities(data.quantities);
        setLoadingQuantities(false);
      })
      .catch(() => {
        setQuantities([]);
        setLoadingQuantities(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return { loadingQuantities, quantities };
}
