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

export { setTimezone };
