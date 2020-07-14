import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { InstrumentWithAvailabilityTime } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useInstrumentsBySEPData(
  sepId: number,
  callId: number
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
    setLoadingInstruments(true);
    api()
      .getInstrumentsBySEP({ sepId, callId })
      .then(data => {
        if (data.instrumentsBySep) {
          setInstrumentsData(
            data.instrumentsBySep as InstrumentWithAvailabilityTime[]
          );
        }
        setLoadingInstruments(false);
      });
  }, [api, sepId, callId]);

  return { loadingInstruments, instrumentsData, setInstrumentsData };
}
