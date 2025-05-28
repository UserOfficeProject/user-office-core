import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

export type FacilityMemberCallsData = {
  id: number;
  shortCode: string;
  templateId: number;
};

export function useFacilityMemberCallsData(userId: number) {
  const [calls, setCalls] = useState<FacilityMemberCallsData[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingCalls(true);
    api()
      .getCallsByFacilityMember({ userId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.callsByFacilityMember) {
          setCalls(data.callsByFacilityMember);
        }
        setLoadingCalls(false);
      });

    return () => {
      unmounted = true;
    };
  }, [userId, api]);

  return { loadingCalls, calls };
}
