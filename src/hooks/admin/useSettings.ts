import { useEffect, useState } from 'react';

import { Settings } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useSettings(): {
  loadingSettings: boolean;
  settings: Settings[];
} {
  const [settings, setSettings] = useState<Settings[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingSettings(true);
    api()
      .getSettings()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setSettings(data.settings);
        setLoadingSettings(false);
      })
      .catch(() => {
        setSettings([]);
        setLoadingSettings(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return { loadingSettings, settings };
}
