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

export function useInstrumentsData(callIds?: number[]): {
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
    if (
      currentRole &&
      [
        UserRole.USER_OFFICER,
        UserRole.SEP_REVIEWER,
        UserRole.SEP_CHAIR,
        UserRole.SEP_SECRETARY,
        UserRole.USER,
      ].includes(currentRole)
    ) {
      api()
        .getInstruments({ callIds })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.instruments) {
            setInstruments(data.instruments.instruments);
          }
          setLoadingInstruments(false);
        });
    } else {
      api()
        .getUserInstruments()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.me?.instruments) {
            setInstruments(data.me.instruments);
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
