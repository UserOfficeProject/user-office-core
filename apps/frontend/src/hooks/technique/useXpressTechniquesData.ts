import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { TechniqueMinimalFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useXpressTechniquesData(): {
  loadingTechniques: boolean;
  techniques: TechniqueMinimalFragment[];
  setTechniquesWithLoading: Dispatch<
    SetStateAction<TechniqueMinimalFragment[]>
  >;
} {
  const [techniques, setTechniques] = useState<TechniqueMinimalFragment[]>([]);
  const [loadingTechniques, setLoadingTechniques] = useState(true);
  const { currentRole, user } = useContext(UserContext);

  const api = useDataApi();

  const setTechniquesWithLoading = (
    data: SetStateAction<TechniqueMinimalFragment[]>
  ) => {
    setLoadingTechniques(true);
    setTechniques(data);
    setLoadingTechniques(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingTechniques(true);
    if (currentRole && [UserRole.INSTRUMENT_SCIENTIST].includes(currentRole)) {
      api()
        .getTechniquesByScientist({ userNumber: user.id })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.techniquesByScientist) {
            const sortedTechniques = data.techniquesByScientist.sort((a, b) =>
              a.name.localeCompare(b.name)
            );

            setTechniques(sortedTechniques);
          }
          setLoadingTechniques(false);
        });
    } else if (currentRole && [UserRole.USER_OFFICER].includes(currentRole)) {
      api()
        .getTechniquesMinimal()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.techniques) {
            const sortedTechniques = data.techniques.techniques.sort((a, b) =>
              a.name.localeCompare(b.name)
            );

            setTechniques(sortedTechniques);
          }
          setLoadingTechniques(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, user]);

  return {
    loadingTechniques,
    techniques,
    setTechniquesWithLoading,
  };
}
