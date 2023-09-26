import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { InstrumentWithAvailabilityTime } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentsBySEPData(
  sepId: number,
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
      return;
    }

    let unmounted = false;

    setLoadingInstruments(true);
    api()
      .getInstrumentsBySEP({ sepId, callId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.instrumentsBySep) {
          setInstrumentsData(
            data.instrumentsBySep as InstrumentWithAvailabilityTime[]
          );
        }
        setLoadingInstruments(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, sepId, callId]);

  return { loadingInstruments, instrumentsData, setInstrumentsData };
}
