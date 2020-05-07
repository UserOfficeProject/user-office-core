import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { GetSepMembersQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPMembersData(
  sepId: number,
  show: boolean
): {
  loadingMembers: boolean;
  SEPMembersData: GetSepMembersQuery['sepMembers'] | null;
  setSEPMembersData: Dispatch<
    SetStateAction<GetSepMembersQuery['sepMembers'] | null>
  >;
} {
  const api = useDataApi();
  const [SEPMembersData, setSEPMembersData] = useState<
    GetSepMembersQuery['sepMembers'] | null
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  useEffect(() => {
    api()
      .getSEPMembers({ sepId })
      .then(data => {
        setSEPMembersData(data.sepMembers);
        setLoadingMembers(false);
      });
  }, [sepId, show, api]);

  return { loadingMembers, SEPMembersData, setSEPMembersData };
}
