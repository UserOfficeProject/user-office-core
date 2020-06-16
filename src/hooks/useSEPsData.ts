import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { Sep } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPsData(
  filter: string,
  active = true,
  role = 'SEP_Reviewer'
): {
  loading: boolean;
  SEPsData: Sep[];
  setSEPsData: Dispatch<SetStateAction<Sep[]>>;
} {
  const api = useDataApi();
  const [SEPsData, setSEPsData] = useState<Sep[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (role === 'user_officer') {
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
    } else {
      api()
        .getUserSeps()
        .then(data => {
          if (data.me?.seps) {
            setSEPsData(
              data.me.seps.map(sep => {
                return {
                  ...sep,
                };
              })
            );
          }
          setLoading(false);
        });
    }
  }, [filter, active, api, role]);

  return { loading, SEPsData, setSEPsData };
}
