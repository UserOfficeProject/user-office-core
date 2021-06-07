import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { Sep, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useSEPsData(
  filter: string,
  active: boolean | undefined,
  role = UserRole.SEP_REVIEWER
): {
  loadingSEPs: boolean;
  SEPs: Sep[];
  setSEPsWithLoading: Dispatch<SetStateAction<Sep[]>>;
} {
  const api = useDataApi();
  const [SEPs, setSEPs] = useState<Sep[]>([]);
  const [loadingSEPs, setLoadingSEPs] = useState(true);

  const setSEPsWithLoading = (data: SetStateAction<Sep[]>) => {
    setLoadingSEPs(true);
    setSEPs(data);
    setLoadingSEPs(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingSEPs(true);

    if (role === UserRole.USER_OFFICER) {
      api()
        .getSEPs({
          filter,
          active,
        })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.seps) {
            setSEPs(
              data.seps.seps.map((sep) => {
                return {
                  ...sep,
                };
              })
            );
          }
          setLoadingSEPs(false);
        });
    } else {
      api()
        .getUserSeps()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.me?.seps) {
            setSEPs(
              data.me.seps.map((sep) => {
                return {
                  ...sep,
                };
              })
            );
          }
          setLoadingSEPs(false);
        });
    }

    return () => {
      unmounted = true;
    };
  }, [filter, active, api, role]);

  return { loadingSEPs, SEPs, setSEPsWithLoading };
}
