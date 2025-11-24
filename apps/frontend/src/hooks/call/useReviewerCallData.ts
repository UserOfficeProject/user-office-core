import { useEffect, useState, SetStateAction } from 'react';

import { Call } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export enum CallsDataQuantity {
  EXTENDED,
  MINIMAL,
}

export function useReviewerCallsData() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  const setCallsWithLoading = (data: SetStateAction<Call[]>) => {
    setLoadingCalls(true);
    setCalls(data);
    setLoadingCalls(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingCalls(true);

    api()
      .getReviewerCalls()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.callsOfReviewer) {
          setCalls(data.callsOfReviewer as Call[]);
        }
        setLoadingCalls(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return { loadingCalls, calls, setCallsWithLoading };
}
