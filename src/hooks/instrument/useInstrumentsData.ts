import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { Instrument, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentsData(
  callIds?: number[]
): {
  loadingInstruments: boolean;
  instruments: Instrument[];
  setInstrumentsWithLoading: Dispatch<SetStateAction<Instrument[]>>;
} {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  const setInstrumentsWithLoading = (data: SetStateAction<Instrument[]>) => {
    setLoadingInstruments(true);
    setInstruments(data);
    setLoadingInstruments(false);
  };

  useEffect(() => {
    let unmounted = false;

    setLoadingInstruments(true);
    if (currentRole === UserRole.USER_OFFICER) {
      api()
        .getInstruments({ callIds })
        .then(data => {
          if (unmounted) {
            return;
          }

          if (data.instruments) {
            setInstruments(data.instruments.instruments as Instrument[]);
          }
          setLoadingInstruments(false);
        });
    } else {
      api()
        .getUserInstruments()
        .then(data => {
          if (unmounted) {
            return;
          }

          if (data.me?.instruments) {
            setInstruments(data.me.instruments as Instrument[]);
          }
          setLoadingInstruments(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, callIds]);

  return {
    loadingInstruments,
    instruments,
    setInstrumentsWithLoading,
  };
}
