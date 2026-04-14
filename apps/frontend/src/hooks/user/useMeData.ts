import { useEffect, useState } from 'react';

import { GetMyRolesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useMeData() {
  const api = useDataApi();
  const [meData, setMeData] = useState<GetMyRolesQuery['me']>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getMyRoles()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setMeData(data.me);
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return { loading, meData, setMeData } as const;
}
