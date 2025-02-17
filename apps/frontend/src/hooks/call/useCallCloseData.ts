import { useEffect, useState } from 'react';

import { Call } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useCallCloseData(callId?: string | null) {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    if (callId) {
      api()
        .getCallCloseDetails({ callId: parseInt(callId) })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.call) {
            setCall(data.call as Call);
          }
          setLoading(false);
        });

      return () => {
        unmounted = true;
      };
    }
  }, [api, callId]);

  return { loading, call, setCall };
}
