import { useEffect, useState } from 'react';

import { AllocationTimeUnits } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useAnswerCallData(answerId: number | null) {
  const [callAllocatedTimeUnit, setCallAllocatedTimeUnit] =
    useState<AllocationTimeUnits | null>();
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    if (answerId === null) {
      setCallAllocatedTimeUnit(null);

      return;
    }
    let unmounted = false;

    setLoadingCalls(true);
    api()
      .getCallByAnswerId({ answerId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.getCallByAnswerId) {
          setCallAllocatedTimeUnit(
            data.getCallByAnswerId.allocationTimeUnit as AllocationTimeUnits
          );
        }
        setLoadingCalls(false);
      });

    return () => {
      unmounted = true;
    };
  }, [answerId, api]);

  return { loadingCalls, callAllocatedTimeUnit };
}
