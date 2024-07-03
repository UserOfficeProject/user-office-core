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

export function useInstruments(): {
  loadingInstruments: boolean;
  instruments: InstrumentFragment[];
  setInstrumentsWithLoading: Dispatch<SetStateAction<InstrumentFragment[]>>;
} {
  const [instruments, setInstruments] = useState<InstrumentFragment[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setInstrumentsWithLoading = (
    data: SetStateAction<InstrumentFragment[]>
  ) => {
    setLoadingInstruments(true);
    setInstruments(data);
    setLoadingInstruments(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingInstruments(true);
    if (currentRole && [UserRole.USER_OFFICER].includes(currentRole)) {
      api()
        .getInstruments()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.instruments) {
            setInstruments(data.instruments.instruments);
          }
          setLoadingInstruments(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole]);

  return {
    loadingInstruments,
    instruments,
    setInstrumentsWithLoading,
  };
}
