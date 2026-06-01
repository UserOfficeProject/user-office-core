import { useContext, useEffect } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';

const DynamicFavicon = () => {
  const { settingsMap } = useContext(SettingsContext);

  const faviconFilename = settingsMap.get(
    SettingsId.FAVICON_FILENAME
  )?.settingsValue;

  useEffect(() => {
    if (faviconFilename) {
      const link: HTMLLinkElement =
        document.querySelector("link[rel*='icon']") ||
        document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = '/images/' + faviconFilename;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [faviconFilename]);

  return null;
};

export default DynamicFavicon;
