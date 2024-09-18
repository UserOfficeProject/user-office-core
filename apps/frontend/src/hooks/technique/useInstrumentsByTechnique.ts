import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { InstrumentFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentsData(techniqueIds: number[]): {
  loadingInstruments: boolean;
  instruments: InstrumentFragment[];
  setInstruments: Dispatch<SetStateAction<InstrumentFragment[]>>;
} {
  const [instruments, setInstruments] = useState<InstrumentFragment[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingInstruments(true);
    api()
      .getTechniquesByIds({ techniqueIds })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (!data.techniquesByIds) {
          return;
        }

        const instruments = data.techniquesByIds
          .filter((technique) => {
            technique.instruments != null;
          })
          .flatMap((technique) => {
            return technique.instruments;
          });

        if (instruments) {
          setInstruments(instruments);
        }
        setLoadingInstruments(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, techniqueIds]);

  return {
    loadingInstruments,
    instruments,
    setInstruments,
  };
}
