import { useEffect, useState } from 'react';

import { Instrument } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useInstrumentData(instrumentId: number | undefined) {
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;
    if (instrumentId) {
      api()
        .getInstrument({ instrumentId })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.instrument) {
            setInstrument(data.instrument as Instrument);
          }
          setLoading(false);
        });

      return () => {
        unmounted = true;
      };
    }
  }, [api, instrumentId]);

  return { loading, instrument, setInstrument };
}
