import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { Institution } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstitutionData(): {
  loadingInstitutions: boolean;
  institutionData: Institution[];
  setInstitutionData: Dispatch<SetStateAction<Institution[]>>;
} {
  const [institutionData, setInstitutionData] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    setLoadingInstitutions(true);
    api()
      .getInstitutions()
      .then(data => {
        setInstitutionData(data.institutions as Institution[]);
        setLoadingInstitutions(false);
      });
  }, [api]);

  return { loadingInstitutions, institutionData, setInstitutionData };
}
