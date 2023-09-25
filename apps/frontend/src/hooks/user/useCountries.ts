import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { GetCountriesQuery } from '../../generated/sdk';

export function useCountries() {
  const [countries, setCountries] = useState<
    GetCountriesQuery['countries'] | null
  >(null);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getCountries()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setCountries(data.countries);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return countries;
}
