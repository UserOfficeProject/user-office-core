import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { AdminDataSource } from '../datasources/AdminDataSource';
import { SettingsId } from '../models/Settings';
import { Tokens } from './Tokens';

/**
 * Sets the timezone Setting from the 'TZ' environment variable,
 * which itself sets the NodeJS timezone. If the variable does
 * not exist, the "default" NodeJS timezone is used for the
 * Setting (not guaranteed to be accurate).
 */
async function setTimezone() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  if (process.env.TZ) {
    await db.updateSettings(SettingsId.TIMEZONE, process.env.TZ);
  } else {
    const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    logger.logInfo(
      `Timezone should be explicitly set via 'TZ' environment variable, defaulting to '${defaultTimezone}'`,
      {}
    );
    await db.updateSettings(SettingsId.TIMEZONE, defaultTimezone);
  }
}

/**
 * Sets the date time Setting from the 'DATE_TIME_FORMAT' environment variable.
 * If the variable does not exist, the "dd-MM-yyyy" format is used for the Setting.
 */
async function setDateTimeFormats() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  if (process.env.DATE_FORMAT) {
    await db.updateSettings(SettingsId.DATE_FORMAT, process.env.DATE_FORMAT);
  } else {
    const defaultDateFormat = 'dd-MM-yyyy';
    logger.logInfo(
      `Date format should be explicitly set via 'DATE_FORMAT' environment variable, defaulting to '${defaultDateFormat}'`,
      {}
    );
    await db.updateSettings(SettingsId.DATE_FORMAT, defaultDateFormat);
  }

  if (process.env.DATE_TIME_FORMAT) {
    await db.updateSettings(
      SettingsId.DATE_TIME_FORMAT,
      process.env.DATE_TIME_FORMAT
    );
  } else {
    const defaultDateTimeFormat = 'dd-MM-yyyy HH:mm';
    logger.logInfo(
      `Date time format should be explicitly set via 'DATE_TIME_FORMAT' environment variable, defaulting to '${defaultDateTimeFormat}'`,
      {}
    );
    await db.updateSettings(SettingsId.DATE_TIME_FORMAT, defaultDateTimeFormat);
  }
}

export { setTimezone, setDateTimeFormats };
