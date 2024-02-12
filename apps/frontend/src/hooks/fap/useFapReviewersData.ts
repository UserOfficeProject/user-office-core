import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { FapReviewer, Role, BasicUserDetails } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type FapMember = Pick<FapReviewer, 'userId' | 'fapId'> & {
  role?: Pick<Role, 'id' | 'shortCode' | 'title'> | null;
} & { user: BasicUserDetails };

export function useFapReviewersData(
  fapId: number,
  show: boolean
): {
  loadingMembers: boolean;
  FapReviewersData: FapMember[];
  setFapReviewersData: Dispatch<SetStateAction<FapMember[]>>;
} {
  const api = useDataApi();
  const [FapReviewersData, setFapReviewersData] = useState<FapMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  useEffect(() => {
    let unmounted = false;

    api()
      .getFapReviewers({ fapId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.fapReviewers) {
          const fapReviewersWithoutPropCount = data.fapReviewers.map(
            (fapReviewer) => {
              return {
                ...fapReviewer,
                proposalsCountByCall:
                  fapReviewer.proposalsCountByCall === -1
                    ? '-'
                    : fapReviewer.proposalsCountByCall,
              };
            }
          );
          setFapReviewersData(fapReviewersWithoutPropCount);
        }
        setLoadingMembers(false);
      });

    return () => {
      unmounted = true;
    };
  }, [fapId, show, api]);

  return {
    loadingMembers,
    FapReviewersData,
    setFapReviewersData,
  } as const;
}
