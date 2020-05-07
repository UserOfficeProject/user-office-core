import { useCallback, useEffect, useState } from 'react';

import { UserWithReviewsQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useUserWithReviewsData(id: number) {
  const api = useDataApi();
  const [userData, setUserData] = useState<UserWithReviewsQuery['me'] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api()
      .userWithReviews({
        id,
      })
      .then(data => {
        setUserData(data.me);
        setLoading(false);
      });
  }, [id, api]);

  return { loading, userData };
}

export function useBasicUserData() {
  const sendRequest = useDataApi();

  const loadBasicUserData = useCallback(
    async (id: number) => {
      return sendRequest()
        .getBasicUserDetails({ id })
        .then(data => data.basicUserDetails);
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
