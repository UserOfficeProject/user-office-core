import {
  SettingsId,
  Settings,
  Maybe,
} from '@user-office-software-libs/shared-types';

export default {
  getEnabledSettings: () => {
    const settings = window.localStorage.getItem('settings');

    let settingsMap = new Map<SettingsId, Maybe<string>>();

    if (settings) {
      settingsMap = new Map(
        JSON.parse(settings).map((settings: Settings) => [
          settings.id,
          settings.settingsValue,
        ])
      );
    }

    return settingsMap;
  },
};
