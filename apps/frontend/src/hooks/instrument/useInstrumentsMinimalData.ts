import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { InstrumentMinimalFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentsMinimalData(callIds?: number[]): {
  loadingInstruments: boolean;
  instruments: InstrumentMinimalFragment[];
  setInstruments: Dispatch<SetStateAction<InstrumentMinimalFragment[]>>;
} {
  const [instruments, setInstruments] = useState<InstrumentMinimalFragment[]>(
    []
  );
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingInstruments(true);
    if (
      currentRole &&
      [
        UserRole.USER_OFFICER,
        UserRole.FAP_REVIEWER,
        UserRole.FAP_CHAIR,
        UserRole.FAP_SECRETARY,
        UserRole.USER,
      ].includes(currentRole)
    ) {
      api()
        .getInstrumentsMinimal({ callIds })
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
        .getMyInstrumentsMinimal()
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
    setInstruments,
  };
}
