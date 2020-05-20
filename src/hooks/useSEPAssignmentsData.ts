import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { GetSepProposalsQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPAssignmentsData(
  sepId: number
): {
  loadingAssignments: boolean;
  SEPAssignmentsData: GetSepProposalsQuery['sepProposals'] | null;
  setSEPAssignmentsData: Dispatch<
    SetStateAction<GetSepProposalsQuery['sepProposals'] | null>
  >;
} {
  const api = useDataApi();
  const [SEPAssignmentsData, setSEPAssignmentsData] = useState<
    GetSepProposalsQuery['sepProposals'] | null
  >([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  useEffect(() => {
    api()
      .getSEPProposals({ sepId })
      .then(data => {
        setSEPAssignmentsData(data.sepProposals);
        setLoadingAssignments(false);
      });
  }, [sepId, api]);

  return { loadingAssignments, SEPAssignmentsData, setSEPAssignmentsData };
}
