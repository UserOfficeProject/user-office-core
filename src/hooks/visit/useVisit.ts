import { useEffect, useState } from 'react';

import { GetVisitQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useVisit(visitId: number) {
  const [visit, setVisit] = useState<GetVisitQuery['visit'] | null>(null);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getVisit({ visitId })
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.visit) {
          setVisit(data.visit);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, visitId]);

  return { visit };
}
