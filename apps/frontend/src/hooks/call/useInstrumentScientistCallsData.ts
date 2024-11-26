import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

export type InstrumentScientistCallsData = {
  id: number;
  shortCode: string;
  templateId: number;
};

export function useInstrumentScientistCallsData(scientistId: number) {
  const [calls, setCalls] = useState<InstrumentScientistCallsData[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingCalls(true);
    api()
      .getCallsByInstrumentScientist({ scientistId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.callsByInstrumentScientist) {
          setCalls(data.callsByInstrumentScientist);
        }
        setLoadingCalls(false);
      });

    return () => {
      unmounted = true;
    };
  }, [scientistId, api]);

  return { loadingCalls, calls };
}
