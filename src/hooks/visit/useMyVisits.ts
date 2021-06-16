import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { VisitBasic } from 'models/VisitSubmissionState';

export function useMyVisits() {
  const [visits, setVisits] = useState<VisitBasic[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingVisits(true);
    api()
      .getMyVisits()
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.myVisits) {
          setVisits(data.myVisits);
        }
        setLoadingVisits(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingVisits,
    visits,
    setVisits,
  };
}
