import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { Sep } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPsData(
  filter: string
): {
  loading: boolean;
  SEPsData: Sep[];
  setSEPsData: Dispatch<SetStateAction<Sep[]>>;
} {
  const api = useDataApi();
  const [SEPsData, setSEPsData] = useState<Sep[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api()
      .getSEPs({
        filter: filter,
      })
      .then(data => {
        if (data.seps) {
          setSEPsData(
            data.seps.seps.map(sep => {
              return {
                ...sep,
              };
            })
          );
        }
        setLoading(false);
      });
  }, [filter, api]);

  return { loading, SEPsData, setSEPsData };
}
