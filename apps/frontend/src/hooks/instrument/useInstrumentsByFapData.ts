import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { InstrumentWithAvailabilityTime } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentsByFapData(
  fapId: number,
  callId?: number
): {
  loadingInstruments: boolean;
  instrumentsData: InstrumentWithAvailabilityTime[];
  setInstrumentsData: Dispatch<
    SetStateAction<InstrumentWithAvailabilityTime[]>
  >;
} {
  const [instrumentsData, setInstrumentsData] = useState<
    InstrumentWithAvailabilityTime[]
  >([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    if (!callId) {
      setLoadingInstruments(false);

      return;
    }

    let unmounted = false;

    setLoadingInstruments(true);
    api()
      .getInstrumentsByFap({ fapId, callId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.instrumentsByFap) {
          setInstrumentsData(
            data.instrumentsByFap as InstrumentWithAvailabilityTime[]
          );
        }
        setLoadingInstruments(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, fapId, callId]);

  return { loadingInstruments, instrumentsData, setInstrumentsData };
}
