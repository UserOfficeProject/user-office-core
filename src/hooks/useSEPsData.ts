import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { Sep } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPsData(
  show: boolean,
  filter: string,
  active = true
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
        active,
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
  }, [filter, show, active, api]);

  return { loading, SEPsData, setSEPsData };
}
