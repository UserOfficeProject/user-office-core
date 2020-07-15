import { useEffect, useState } from 'react';

import { Institution } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstitutionData() {
  const [institutionData, setInstitutionData] = useState<Institution[] | null>(
    null
  );

  const api = useDataApi();

  useEffect(() => {
    api()
      .getInstitutions()
      .then(data => {
        setInstitutionData(data.institutions);
      });
  }, [api]);

  return { institutionData, setInstitutionData };
}
