import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { SepReviewer, Role, BasicUserDetails } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type SepMember = Pick<SepReviewer, 'userId' | 'sepId'> & {
  role?: Pick<Role, 'id' | 'shortCode' | 'title'> | null;
} & { user: BasicUserDetails };

export function useSEPMembersData(
  sepId: number,
  show: boolean
): {
  loadingMembers: boolean;
  SEPMembersData: SepMember[];
  setSEPMembersData: Dispatch<SetStateAction<SepMember[]>>;
} {
  const api = useDataApi();
  const [SEPMembersData, setSEPMembersData] = useState<SepMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  useEffect(() => {
    let unmounted = false;

    api()
      .getSEPMembers({ sepId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.sepMembers) {
          setSEPMembersData(data.sepMembers);
        }
        setLoadingMembers(false);
      });

    return () => {
      unmounted = true;
    };
  }, [sepId, show, api]);

  return { loadingMembers, SEPMembersData, setSEPMembersData } as const;
}
