import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { GetInstrumentsByIdsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentsByIdsData(instrumentIds: number[] | null): {
  loadingInstruments: boolean;
  instruments: GetInstrumentsByIdsQuery['instrumentsByIds'];
  setInstruments: Dispatch<
    SetStateAction<GetInstrumentsByIdsQuery['instrumentsByIds']>
  >;
} {
  const api = useDataApi();

  const [instruments, setInstruments] = useState<
    GetInstrumentsByIdsQuery['instrumentsByIds']
  >([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);

  useEffect(() => {
    let unmounted = false;

    if (!instrumentIds) {
      return;
    }

    setLoadingInstruments(true);

    api()
      .getInstrumentsByIds({ instrumentIds })
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
