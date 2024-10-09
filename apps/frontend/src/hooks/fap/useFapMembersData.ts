import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { FapReviewer, Role, BasicUserDetails } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type FapMember = Pick<
  FapReviewer,
  'userId' | 'fapId' | 'proposalsCountByCall'
> & {
  role?: Pick<Role, 'id' | 'shortCode' | 'title'> | null;
  user: BasicUserDetails;
};

export function useFapMembersData(
  fapId: number,
  show: boolean
): {
  loadingMembers: boolean;
  FapMembersData: FapMember[];
  setFapMembersData: Dispatch<SetStateAction<FapMember[]>>;
} {
  const api = useDataApi();
  const [FapMembersData, setFapMembersData] = useState<FapMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  useEffect(() => {
    let unmounted = false;

    api()
      .getFapMembers({ fapId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.fapMembers) {
          setFapMembersData(data.fapMembers);
        }
        setLoadingMembers(false);
      });

    return () => {
      unmounted = true;
    };
  }, [fapId, show, api]);

  return { loadingMembers, FapMembersData, setFapMembersData } as const;
}
