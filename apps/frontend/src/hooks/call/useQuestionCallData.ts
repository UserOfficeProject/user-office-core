import { useEffect, useState } from 'react';

import { Call } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useQuestionCallData(questionId: string) {
  const [call, setCall] = useState<Call | null>();
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingCalls(true);
    api()
      .getCallByQuestionId({ questionId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.callByQuestionId) {
          setCall(data.callByQuestionId as Call);
        }
        setLoadingCalls(false);
      });

    return () => {
      unmounted = true;
    };
  }, [questionId, api]);

  return { loadingCalls, call };
}
