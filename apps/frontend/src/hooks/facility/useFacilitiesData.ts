import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { InstrumentMinimalFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type FacilityData = {
  id: number;
  name: string;
  shortCode: string;
  instruments: InstrumentMinimalFragment[];
  calls: { id: number; shortCode: string }[];
};

export function useFacilitiesData(): {
  loadingFacilities: boolean;
  facilities: FacilityData[];
  setFacilitiesWithLoading: Dispatch<SetStateAction<FacilityData[]>>;
} {
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);

  const api = useDataApi();

  const setFacilitiesWithLoading = (data: SetStateAction<FacilityData[]>) => {
    setLoadingFacilities(true);
    setFacilities(data);
    setLoadingFacilities(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingFacilities(true);

    api()
      .getFacilities()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data) {
          setFacilities(data.facilities);
        }
        setLoadingFacilities(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api]);

  return {
    loadingFacilities: loadingFacilities,
    facilities,
    setFacilitiesWithLoading: setFacilitiesWithLoading,
  };
}
