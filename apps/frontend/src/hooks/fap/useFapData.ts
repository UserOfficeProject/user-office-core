import { useState, useEffect } from 'react';

import { Fap } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFapData(id?: number | string) {
  const [loading, setLoading] = useState(true);
  const [fap, setFap] = useState<Fap | null>(null);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    if (!id) {
      return;
    }

    setLoading(true);
    api()
      .getFap({ id: typeof id === 'string' ? parseInt(id) : id })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.fap) {
          setFap(data.fap);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [id, api]);

  return { loading, fap, setFap } as const;
}
