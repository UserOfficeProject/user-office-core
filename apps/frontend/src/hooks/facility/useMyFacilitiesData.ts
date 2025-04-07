import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { InstrumentMinimalFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type MyFacilityData = {
  id: number;
  name: string;
  shortCode: string;
  instruments: InstrumentMinimalFragment[];
};

export function useMyFacilitiesData(): {
  loadingFacilities: boolean;
  facilities: MyFacilityData[];
  setFacilitiesWithLoading: Dispatch<SetStateAction<MyFacilityData[]>>;
} {
  const [facilities, setFacilities] = useState<MyFacilityData[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);

  const api = useDataApi();

  const setFacilitiesWithLoading = (data: SetStateAction<MyFacilityData[]>) => {
    setLoadingFacilities(true);
    setFacilities(data);
    setLoadingFacilities(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingFacilities(true);

    api()
      .getMyFacilities()
      .then((data) => {
        console.log(data);
        if (unmounted) {
          return;
        }

        if (data.me?.facilities) {
          setFacilities(data.me?.facilities);
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
