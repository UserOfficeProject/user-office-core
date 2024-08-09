import Box from '@mui/material/Box';
import React from 'react';

import { Settings, SettingsId } from 'generated/sdk';
import { useSettings } from 'hooks/admin/useSettings';

interface SettingsContextData {
  readonly settingsMap: Map<SettingsId, Settings>;
  readonly settings: Settings[];
  readonly setSettings: React.Dispatch<React.SetStateAction<Settings[]>>;
}

const initialSettingsData: SettingsContextData = {
  settingsMap: new Map<SettingsId, Settings>(),
  settings: [],
  setSettings: () => {},
};

export const SettingsContext =
  React.createContext<SettingsContextData>(initialSettingsData);

export const SettingsContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const { settings, loadingSettings, setSettings } = useSettings();

  if (loadingSettings) {
    return (
      <Box
        sx={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        data-cy="loading"
      >
        Loading...
      </Box>
    );
  }

  const settingsMap = settings.reduce(function (settingsMap, settings) {
    settingsMap.set(settings.id, settings);

    return settingsMap;
  }, new Map<SettingsId, Settings>());

  return (
    <SettingsContext.Provider value={{ settings, settingsMap, setSettings }}>
      {props.children}
    </SettingsContext.Provider>
  );
};
