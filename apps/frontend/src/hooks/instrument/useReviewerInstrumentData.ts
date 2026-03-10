import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { InstrumentMinimalFragment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useReviewerInstrumentData(): {
  loadingInstruments: boolean;
  instruments: InstrumentMinimalFragment[];
  setInstruments: Dispatch<SetStateAction<InstrumentMinimalFragment[]>>;
} {
  const api = useDataApi();

  const [instruments, setInstruments] = useState<InstrumentMinimalFragment[]>(
    []
  );
  const [loadingInstruments, setLoadingInstruments] = useState(true);

  useEffect(() => {
    let unmounted = false;

    setLoadingInstruments(true);

    api()
      .getReviewerInstruments()
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.getInstrumentsOfReviewer) {
          setInstruments(data.getInstrumentsOfReviewer);
        }
        setLoadingInstruments(false);
      });

    return () => {
      // used to avoid unmounted component state update error
      unmounted = true;
    };
  }, [api]);

  return {
    loadingInstruments,
    instruments,
    setInstruments,
  };
}
