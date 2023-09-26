import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { GetNationalitiesQuery } from '../../generated/sdk';

export function useNationalities() {
  const [nationalities, setNationalities] = useState<
    GetNationalitiesQuery['nationalities'] | null
  >(null);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getNationalities()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setNationalities(data.nationalities);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return nationalities;
}
