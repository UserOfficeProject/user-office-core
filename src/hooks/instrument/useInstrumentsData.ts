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
  instrumentsData: Instrument[];
  setInstrumentsData: Dispatch<SetStateAction<Instrument[]>>;
} {
  const [instrumentsData, setInstrumentsData] = useState<Instrument[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  useEffect(() => {
    setLoadingInstruments(true);
    if (currentRole === UserRole.USER_OFFICER) {
      api()
        .getInstruments({ callIds })
        .then(data => {
          if (data.instruments) {
            setInstrumentsData(data.instruments.instruments as Instrument[]);
          }
          setLoadingInstruments(false);
        });
    } else {
      api()
        .getUserInstruments()
        .then(data => {
          if (data.me?.instruments) {
            setInstrumentsData(data.me.instruments as Instrument[]);
          }
          setLoadingInstruments(false);
        });
    }
  }, [api, currentRole, callIds]);

  return { loadingInstruments, instrumentsData, setInstrumentsData };
}
