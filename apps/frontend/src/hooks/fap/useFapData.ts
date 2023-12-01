import { useState, useEffect } from 'react';

import { Fap } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFapData(id: number) {
  const [loading, setLoading] = useState(true);
  const [fap, setFap] = useState<Fap | null>(null);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getFap({ id })
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
