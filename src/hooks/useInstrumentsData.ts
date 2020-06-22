import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { Instrument } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useInstrumentsData(): {
  loading: boolean;
  instrumentsData: Instrument[];
  setInstrumentsData: Dispatch<SetStateAction<Instrument[]>>;
} {
  const [instrumentsData, setInstrumentsData] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    setLoading(true);
    api()
      .getInstruments()
      .then(data => {
        if (data.instruments) {
          setInstrumentsData(data.instruments.instruments as Instrument[]);
        }
        setLoading(false);
      });
  }, [api]);

  return { loading, instrumentsData, setInstrumentsData };
}
