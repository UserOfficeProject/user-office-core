import { use, useState } from 'react';

import { Settings } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

let settingsPromise: Promise<Settings[]> | undefined;

function loadSettings(api: ReturnType<typeof useDataApi>): Promise<Settings[]> {
  if (!settingsPromise) {
    settingsPromise = api()
      .getSettings()
      .then((data) => data.settings);
  }

  return settingsPromise;
}

export function useSettings(): {
  settings: Settings[];
  setSettings: React.Dispatch<React.SetStateAction<Settings[]>>;
} {
  const api = useDataApi();

  const initialSettings = use(loadSettings(api));
  const [settings, setSettings] = useState(initialSettings);

  return { settings, setSettings };
}
