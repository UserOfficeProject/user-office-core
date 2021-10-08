import { useCallback, useEffect, useState } from 'react';

import { ReviewerFilter } from 'generated/sdk';
import { UserWithReviewsQuery, ReviewStatus } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUserWithReviewsData(filters?: {
  callId?: number;
  instrumentId?: number;
  status?: ReviewStatus;
  reviewer?: ReviewerFilter;
}) {
  const api = useDataApi();
  const [userWithReviewsFilter, setUserWithReviewsFilter] = useState(filters);
  const [userData, setUserData] = useState<UserWithReviewsQuery['me'] | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .userWithReviews(userWithReviewsFilter)
      .then((data) => {
        if (unmounted) {
          return;
        }

        setUserData(data.me);
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [userWithReviewsFilter, api]);

  return { loading, userData, setUserData, setUserWithReviewsFilter } as const;
}

export function useBasicUserData() {
  const sendRequest = useDataApi();

  const loadBasicUserData = useCallback(
    async (id: number) => {
      return sendRequest()
        .getBasicUserDetails({ id })
        .then((data) => data.basicUserDetails);
    },
    [sendRequest]
  );

  return { loadBasicUserData };
}

export interface BasicUserData {
  firstname: string;
  lastname: string;
  organisation: string;
  id: number;
}
