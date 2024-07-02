import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { TechniqueFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useTechniquesData(callIds?: number[]): {
  loadingTechniques: boolean;
  techniques: TechniqueFragment[];
  setTechniquesWithLoading: Dispatch<SetStateAction<TechniqueFragment[]>>;
} {
  const [techniques, setTechniques] = useState<TechniqueFragment[]>([]);
  const [loadingTechniques, setLoadingTechniques] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setTechniquesWithLoading = (
    data: SetStateAction<TechniqueFragment[]>
  ) => {
    setLoadingTechniques(true);
    setTechniques(data);
    setLoadingTechniques(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingTechniques(true);
    if (currentRole && [UserRole.USER_OFFICER].includes(currentRole)) {
      api()
        .getTechniques()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.techniques) {
            setTechniques(data.techniques.techniques);
          }
          setLoadingTechniques(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, callIds]);

  return {
    loadingTechniques,
    techniques,
    setTechniquesWithLoading,
  };
}
