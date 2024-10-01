import { useEffect, useState } from 'react';

import { GetVisitRegistrationsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { VisitRegistrationCoreWithQuestionaryAndUsers } from 'models/questionary/visit/VisitRegistrationWithQuestionaryAndUsers';

export function useVisitRegistrationsWithVisitAndUsers(
  filter?: GetVisitRegistrationsFilter
) {
  const [visitRegistrationsFilter, setVisitRegistrationsFilter] =
    useState(filter);
  const [visitRegistrations, setVisitRegistrations] = useState<
    VisitRegistrationCoreWithQuestionaryAndUsers[]
  >([]);
  const [loadingVisitRegistrations, setLoadingVisitRegistrations] =
    useState(false);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    setLoadingVisitRegistrations(true);
    api()
      .getVisitRegistrationsWithQuestionaryStatus({
        filter: visitRegistrationsFilter,
      })
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.visitRegistrations) {
          setVisitRegistrations(data.visitRegistrations);
        }
        setLoadingVisitRegistrations(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, visitRegistrationsFilter]);

  return {
    visitRegistrations,
    setVisitRegistrations,
    setVisitRegistrationsFilter,
    loadingVisitRegistrations,
  };
}
