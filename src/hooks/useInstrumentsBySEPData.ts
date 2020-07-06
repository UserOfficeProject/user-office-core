import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { Instrument } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useInstrumentsBySEPData(
  sepId: number
): {
  loadingInstruments: boolean;
  instrumentsData: Instrument[];
  setInstrumentsData: Dispatch<SetStateAction<Instrument[]>>;
} {
  const [instrumentsData, setInstrumentsData] = useState<Instrument[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    setLoadingInstruments(true);
    api()
      .getInstrumentsBySEP({ sepId })
      .then(data => {
        if (data.instrumentsBySep) {
          setInstrumentsData(data.instrumentsBySep as Instrument[]);
        }
        setLoadingInstruments(false);
      });
  }, [api, sepId]);

  return { loadingInstruments, instrumentsData, setInstrumentsData };
}
