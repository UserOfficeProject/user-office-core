import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { GetInstrumentsByIdsMinimalQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentsByIdsData(instrumentIds: number[] | null): {
  loadingInstruments: boolean;
  instruments: GetInstrumentsByIdsMinimalQuery['instrumentsByIds'];
  setInstruments: Dispatch<
    SetStateAction<GetInstrumentsByIdsMinimalQuery['instrumentsByIds']>
  >;
} {
  const api = useDataApi();

  const [instruments, setInstruments] = useState<
    GetInstrumentsByIdsMinimalQuery['instrumentsByIds']
  >([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);

  useEffect(() => {
    let unmounted = false;

    if (!instrumentIds?.length) {
      setLoadingInstruments(false);

      return;
    }

    setLoadingInstruments(true);

    api()
      .getInstrumentsByIdsMinimal({ instrumentIds })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.instrumentsByIds) {
          setInstruments(data.instrumentsByIds);
        }
        setLoadingInstruments(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api, instrumentIds]);

  return {
    loadingInstruments,
    instruments,
    setInstruments,
  };
}
