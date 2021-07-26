import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { GetVisitRegistrationQuery } from './../../generated/sdk';

export function useVisitRegistration(visitId: number) {
  const [registration, setRegistration] = useState<
    GetVisitRegistrationQuery['visitRegistration'] | null
  >(null);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getVisitRegistration({ visitId })
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.visitRegistration) {
          setRegistration(data.visitRegistration);
        }
      });

    return () => {
      unmounted = true;
    };
  }, [api, visitId]);

  return { registration };
}
