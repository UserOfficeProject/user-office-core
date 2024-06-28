import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { GetTechniquesByIdsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useTechniquesByIdsData(techniqueIds: number[] | null): {
  loadingTechniques: boolean;
  techniques: GetTechniquesByIdsQuery['techniquesByIds'];
  setTechniques: Dispatch<
    SetStateAction<GetTechniquesByIdsQuery['techniquesByIds']>
  >;
} {
  const api = useDataApi();

  const [techniques, setTechniques] = useState<
    GetTechniquesByIdsQuery['techniquesByIds']
  >([]);
  const [loadingTechniques, setLoadingTechniques] = useState(true);

  useEffect(() => {
    let unmounted = false;

    if (!techniqueIds?.length) {
      setLoadingTechniques(false);

      return;
    }

    setLoadingTechniques(true);

    api()
      .getTechniquesByIds({ techniqueIds })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.techniquesByIds) {
          setTechniques(data.techniquesByIds);
        }
        setLoadingTechniques(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, techniqueIds]);

  return {
    loadingTechniques,
    techniques,
    setTechniques,
  };
}
