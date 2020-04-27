import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import { GetSepAssignmentsQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useSEPAssignmentsData(
  id: number,
  show: boolean
): {
  loadingAssignments: boolean;
  SEPAssignmentsData: GetSepAssignmentsQuery['sepAssignments'] | null;
  setSEPAssignmentsData: Dispatch<
    SetStateAction<GetSepAssignmentsQuery['sepAssignments'] | null>
  >;
} {
  const api = useDataApi();
  const [SEPAssignmentsData, setSEPAssignmentsData] = useState<
    GetSepAssignmentsQuery['sepAssignments'] | null
  >([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  useEffect(() => {
    api()
      .getSEPAssignments({ id })
      .then(data => {
        setSEPAssignmentsData(data.sepAssignments);
        setLoadingAssignments(false);
      });
  }, [id, show, api]);

  return { loadingAssignments, SEPAssignmentsData, setSEPAssignmentsData };
}
