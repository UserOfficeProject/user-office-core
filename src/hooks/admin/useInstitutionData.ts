import { useEffect, useState, SetStateAction } from 'react';

import { Institution } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstitutionsData(
  { country } = {
    country: false,
  }
) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const api = useDataApi();

  const setInstitutionsWithLoading = (data: SetStateAction<Institution[]>) => {
    setLoadingInstitutions(true);
    setInstitutions(data);
    setLoadingInstitutions(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingInstitutions(true);
    if (country) {
      api()
        .getInstitutionsWithCountry()
        .then((data) => {
          if (unmounted) {
            return;
          }

          setInstitutions(data.institutions as Institution[]);
          setLoadingInstitutions(false);
        });
    } else {
      api()
        .getInstitutions()
        .then((data) => {
          if (unmounted) {
            return;
          }

          setInstitutions(data.institutions as Institution[]);
          setLoadingInstitutions(false);
        });
    }

    return () => {
      unmounted = true;
    };
  }, [api, country]);

  return {
    loadingInstitutions,
    institutions,
    setInstitutionsWithLoading,
    setInstitutions,
  };
}
