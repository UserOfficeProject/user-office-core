import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  Call,
  InstrumentFragment,
  TechniqueFragment,
  UserRole,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';

export function useXpressInstrumentsData(
  proposals?: ProposalViewData[],
  techniques?: TechniqueFragment[],
  calls?: Call[]
): {
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
    if (
      currentRole &&
      [UserRole.USER_OFFICER, UserRole.INSTRUMENT_SCIENTIST].includes(
        currentRole
      )
    ) {
      const instrumentIdsFromCalls = calls
        ? calls
            .filter(
              (call) =>
                call.instruments != null || call.instruments != undefined
            )
            .flatMap((call) => call.instruments)
            .map((instrument) => instrument.id)
        : [];

      const instrumentsFromTechniques = techniques
        ? techniques
            .filter(
              (technique) =>
                technique.instruments != null ||
                technique.instruments != undefined
            )
            .flatMap((technique) => technique.instruments)
        : [];

      const uniqueInstruments = Array.from(new Set(instrumentsFromTechniques));

      const instrumentsList = uniqueInstruments
        .filter((instrument) => {
          if (instrumentIdsFromCalls.includes(instrument.id)) {
            return instrument;
          }
        })
        .reduce((unique: InstrumentFragment[], item) => {
          if (!unique.find((obj: InstrumentFragment) => obj.id === item.id)) {
            unique.push(item);
          }

          return unique;
        }, []);

      if (unmounted) {
        return;
      }
      setInstruments(instrumentsList);
      setLoadingInstruments(false);
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, proposals, calls, techniques]);

  return {
    loadingInstruments,
    instruments,
    setInstruments,
  };
}
