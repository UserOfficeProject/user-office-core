import { useEffect, useState } from 'react';

import { GetOrcIdInformationQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useOrcIDInformation(authorizationCode?: string | null) {
  const [orcData, setOrcData] = useState<
    GetOrcIdInformationQuery['getOrcIDInformation']
  >(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    if (!authorizationCode) {
      setOrcData(null);
      setLoading(false);

      return;
    }
    api()
      .getOrcIDInformation({ authorizationCode })
      .then(data => {
        setOrcData(data.getOrcIDInformation);
        setLoading(false);
      });
  }, [authorizationCode, api]);

  return { loading, orcData };
}
