import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { Instrument } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';

export function useInstrumentsData(): {
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
      .getInstruments()
      .then(data => {
        if (data.instruments) {
          setInstrumentsData(data.instruments.instruments as Instrument[]);
        }
        setLoadingInstruments(false);
      });
  }, [api]);

  return { loadingInstruments, instrumentsData, setInstrumentsData };
}
