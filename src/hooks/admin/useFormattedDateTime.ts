import { DateTime } from 'luxon';
import { useContext } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';

export function useFormattedDateTime(params?: {
  settingsFormatToUse?: SettingsId;
  shouldUseTimeZone?: boolean;
}) {
  const { settings } = useContext(SettingsContext);
  const settingsFormat =
    params?.settingsFormatToUse || SettingsId.DATE_TIME_FORMAT;
  const format = settings.get(settingsFormat)?.settingsValue;
  const timezone = settings.get(SettingsId.TIMEZONE)?.settingsValue;
  const settingsTimeZone = (params?.shouldUseTimeZone && timezone) || undefined;
  const mask = format?.replace(/[a-zA-Z]/g, '_');

  const toFormattedDateTime = (
    isoDateTime = DateTime.now().toISO()
  ): string => {
    const dateTime = DateTime.fromISO(isoDateTime, {
      zone: settingsTimeZone,
    });

    if (!format) {
      // IF format is not provided with the settings return some default one from luxon
      return dateTime.toLocaleString(DateTime.DATETIME_SHORT);
    }

    return dateTime.toFormat(format);
  };

  return { toFormattedDateTime, format, mask, timezone };
}
