import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { Unit } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUnitsData(): {
  loadingUnits: boolean;
  units: Unit[];
  setUnitsWithLoading: Dispatch<SetStateAction<Unit[]>>;
} {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const api = useDataApi();

  const setUnitsWithLoading = (data: SetStateAction<Unit[]>) => {
    setLoadingUnits(true);
    setUnits(data);
    setLoadingUnits(false);
  };

  useEffect(() => {
    setLoadingUnits(true);
    api()
      .getUnits()
      .then((data) => {
        if (data.units) {
          setUnits(data.units as Unit[]);
        }
        setLoadingUnits(false);
      });
  }, [api]);

  return {
    loadingUnits,
    units,
    setUnitsWithLoading,
  };
}
