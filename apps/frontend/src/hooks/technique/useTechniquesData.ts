import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { InstrumentFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useTechniquesData(callIds?: number[]): {
  loadingTechniques: boolean;
  techniques: InstrumentFragment[];
  setTechniquesWithLoading: Dispatch<SetStateAction<InstrumentFragment[]>>;
} {
  const [techniques, setTechniques] = useState<InstrumentFragment[]>([]);
  const [loadingTechniques, setLoadingTechniques] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setTechniquesWithLoading = (
    data: SetStateAction<InstrumentFragment[]>
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
        .getInstruments({ callIds })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.instruments) {
            setTechniques(data.instruments.instruments);
          }
          setLoadingTechniques(false);
        });
    } else {
      api()
        .getMyInstruments()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.me?.instruments) {
            setTechniques(data.me.instruments);
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
