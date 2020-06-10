import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { Sep, UserRole } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPsData(
  show: boolean,
  filter: string,
  active = true,
  role = UserRole.SEP_REVIEWER
): {
  loading: boolean;
  SEPsData: Sep[];
  setSEPsData: Dispatch<SetStateAction<Sep[]>>;
} {
  const api = useDataApi();
  const [SEPsData, setSEPsData] = useState<Sep[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (role === UserRole.USER_OFFICER) {
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
  }, [filter, show, active, api, role]);

  return { loading, SEPsData, setSEPsData };
}
