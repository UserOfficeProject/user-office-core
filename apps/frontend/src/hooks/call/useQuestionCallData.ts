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
      .getCallAllocatedTimeUnit({ answerId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.getCallAllocatedTimeUnit) {
          setCallAllocatedTimeUnit(
            data.getCallAllocatedTimeUnit
              .allocationTimeUnit as AllocationTimeUnits
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
