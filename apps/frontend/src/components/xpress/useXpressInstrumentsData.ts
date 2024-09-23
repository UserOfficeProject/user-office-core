import {
  useEffect,
  useState,
  SetStateAction,
  Dispatch,
  useContext,
} from 'react';

import { UserContext } from 'context/UserContextProvider';
import { InstrumentFragment, TechniqueFragment, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import { ProposalViewData } from './useProposalsCoreData';

export function useXpressInstrumentsData(
  proposals?: ProposalViewData[],
  techniques?: TechniqueFragment[]
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
      const callIds =
        proposals != null && proposals != undefined
          ? Array.from(
              new Set(
                proposals
                  .filter((proposal) => proposal.callId != null)
                  .map((proposal) => proposal.callId)
              )
            )
          : [];

      const instrumentIdList = techniques
        ? techniques
            .filter(
              (technique) =>
                technique.instruments != null ||
                technique.instruments != undefined
            )
            .flatMap((technique) => technique.instruments)
            .map((instrument) => instrument.id)
        : [];

      api()
        .getInstruments({ callIds })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.instruments) {
            const instruments = data.instruments.instruments.filter(
              (instrument) => instrumentIdList.includes(instrument.id)
            );
            setInstruments(instruments);
          }
          setLoadingInstruments(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, proposals]);

  return {
    loadingInstruments,
    instruments,
    setInstruments,
  };
}
