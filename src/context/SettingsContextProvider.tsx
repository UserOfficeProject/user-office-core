import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import { Settings, SettingsId } from 'generated/sdk';
import { useSettings } from 'hooks/admin/useSettings';

interface SettingsContextData {
  readonly settings: Map<SettingsId, Settings>;
}

const useStyles = makeStyles({
  loader: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const initialSettingsData: SettingsContextData = {
  settings: new Map<SettingsId, Settings>(),
};

export const SettingsContext =
  React.createContext<SettingsContextData>(initialSettingsData);

export const SettingsContextProvider: React.FC = (props) => {
  const { settings, loadingSettings } = useSettings();
  const classes = useStyles();

  if (loadingSettings) {
    return (
      <div className={classes.loader} data-cy="loading">
        Loading...
      </div>
    );
  }

  const settingsMap = settings.reduce(function (settingsMap, settings) {
    settingsMap.set(settings.id, settings);

    return settingsMap;
  }, new Map<SettingsId, Settings>());

  return (
    <SettingsContext.Provider value={{ settings: settingsMap }}>
      {props.children}
    </SettingsContext.Provider>
  );
};
