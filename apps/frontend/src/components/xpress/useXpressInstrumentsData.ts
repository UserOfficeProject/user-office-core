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

import { ProposalViewData } from './useProposalsCoreData';

export function useXpressInstrumentsData(proposals?: ProposalViewData[]): {
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
          ? proposals
              .filter((proposal) => {
                proposal.callId != null;
              })
              .map((proposal) => {
                return proposal.callId;
              })
          : [];

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
