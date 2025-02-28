import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { InstrumentMinimalFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useFapInstruments(
  fapId: number,
  callId: number | null
): {
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

    api()
      .getInstrumentHasProposals({ fapId, callId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.fapProposals) {
          setInstruments(
            data.fapProposals
              .map((fapProposal) => fapProposal.instrument)
              .filter(
                (instrument): instrument is InstrumentMinimalFragment =>
                  instrument !== null
              )
              .filter(
                (instrument, index, self) =>
                  self.findIndex((inst) => inst.id === instrument.id) === index
              )
          );
        }
        setLoadingInstruments(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, callId, fapId]);

  return {
    loadingInstruments,
    instruments,
    setInstruments,
  };
}
