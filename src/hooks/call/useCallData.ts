import { useEffect, useState } from 'react';

import { Call } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useCallData(callId: number) {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getCall({ id: callId })
      .then(data => {
        if (data.call) {
          setCall(data.call);
        }
        setLoading(false);
      });
  }, [api, callId]);

  return { loading, call, setCall };
}
