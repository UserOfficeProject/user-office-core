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
  const { settings, setSettings } = useSettings();

  const settingsMap = settings.reduce(function (settingsMap, settings) {
    settingsMap.set(settings.id, settings);

    return settingsMap;
  }, new Map<SettingsId, Settings>());

  return (
    <SettingsContext value={{ settings, settingsMap, setSettings }}>
      {props.children}
    </SettingsContext>
  );
};
