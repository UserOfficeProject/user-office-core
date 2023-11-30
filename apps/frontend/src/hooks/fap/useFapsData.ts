import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { Fap, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFapsData({
  filter,
  active,
  role = UserRole.FAP_REVIEWER,
  callIds,
}: {
  filter: string;
  active?: boolean;
  role?: UserRole;
  callIds?: number[];
}): {
  loadingFaps: boolean;
  Faps: Fap[];
  setFapsWithLoading: Dispatch<SetStateAction<Fap[]>>;
} {
  const api = useDataApi();
  const [Faps, setFaps] = useState<Fap[]>([]);
  const [loadingFaps, setLoadingFaps] = useState(true);

  const setFapsWithLoading = (data: SetStateAction<Fap[]>) => {
    setLoadingFaps(true);
    setFaps(data);
    setLoadingFaps(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingFaps(true);

    if (role === UserRole.USER_OFFICER) {
      api()
        .getFaps({
          filter: {
            filter,
            active,
            callIds,
          },
        })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.faps) {
            setFaps(
              data.faps.faps.map((fap) => {
                return {
                  ...fap,
                };
              })
            );
          }
          setLoadingFaps(false);
        });
    } else {
      api()
        .getUserFaps()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.me?.faps) {
            setFaps(
              data.me.faps.map((fap) => {
                return {
                  ...fap,
                };
              })
            );
          }
          setLoadingFaps(false);
        });
    }

    return () => {
      unmounted = true;
    };
  }, [filter, active, api, role, callIds]);

  return { loadingFaps, Faps, setFapsWithLoading };
}
