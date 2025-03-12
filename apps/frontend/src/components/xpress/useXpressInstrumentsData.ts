import { useEffect, useState, useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  InstrumentMinimalFragment,
  TechniqueMinimalFragment,
  UserRole,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useXpressInstrumentsData(
  techniques?: TechniqueMinimalFragment[]
): {
  loadingInstruments: boolean;
  allInstruments: InstrumentMinimalFragment[];
  techniqueInstruments: InstrumentMinimalFragment[];
} {
  const [allInstruments, setAllInstruments] = useState<
    InstrumentMinimalFragment[]
  >([]);
  const [techniqueInstruments, setTechniqueInstruments] = useState<
    InstrumentMinimalFragment[]
  >([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const { currentRole } = useContext(UserContext);

  const api = useDataApi();

  useEffect(() => {
    if (!techniques) {
      return;
    }

    if (techniques.length === 0) {
      setLoadingInstruments(false);

      return;
    }

    let unmounted = false;

    setLoadingInstruments(true);
    if (
      currentRole &&
      [UserRole.USER_OFFICER, UserRole.INSTRUMENT_SCIENTIST].includes(
        currentRole
      )
    ) {
      api()
        .getInstrumentsMinimal()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.instruments) {
            setAllInstruments(data.instruments.instruments);

            const techniqueInstrumentIds = new Set(
              techniques?.flatMap((technique) =>
                technique.instruments.map((instrument) => instrument.id)
              ) || []
            );

            const filteredInstruments = data.instruments.instruments.filter(
              (instrument) => techniqueInstrumentIds.has(instrument.id)
            );

            filteredInstruments.sort((a, b) => a.name.localeCompare(b.name));

            setTechniqueInstruments(filteredInstruments);
          }
          setLoadingInstruments(false);
        });
    }

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, currentRole, techniques]);

  return {
    loadingInstruments,
    allInstruments,
    techniqueInstruments,
  };
}
