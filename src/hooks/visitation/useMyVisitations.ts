import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { VisitationBasic } from 'models/VisitationSubmissionState';

export function useMyVisitations() {
  const [visitations, setVisitations] = useState<VisitationBasic[]>([]);
  const [loadingVisitations, setLoadingVisitations] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingVisitations(true);
    api()
      .getMyVisitations()
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.myVisitations) {
          setVisitations(data.myVisitations);
        }
        setLoadingVisitations(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return {
    loadingVisitations,
    visitations,
    setVisitations,
  };
}
