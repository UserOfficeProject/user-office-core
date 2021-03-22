import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { SepReviewer, Role, BasicUserDetails } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type SepMember = Pick<SepReviewer, 'userId' | 'sepId'> & {
  role?: Pick<Role, 'id' | 'shortCode' | 'title'> | null;
} & { user: BasicUserDetails };

export function useSEPReviewersData(
  sepId: number,
  show: boolean
): {
  loadingMembers: boolean;
  SEPReviewersData: SepMember[];
  setSEPReviewersData: Dispatch<SetStateAction<SepMember[]>>;
} {
  const api = useDataApi();
  const [SEPReviewersData, setSEPReviewersData] = useState<SepMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  useEffect(() => {
    let unmounted = false;

    api()
      .getSEPReviewers({ sepId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.sepReviewers) {
          setSEPReviewersData(data.sepReviewers);
        }
        setLoadingMembers(false);
      });

    return () => {
      unmounted = true;
    };
  }, [sepId, show, api]);

  return {
    loadingMembers,
    SEPReviewersData,
    setSEPReviewersData,
  } as const;
}
