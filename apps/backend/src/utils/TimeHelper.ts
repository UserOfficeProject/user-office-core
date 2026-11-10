import { GraphQLError } from 'graphql';
import { DateTime, Info } from 'luxon';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { SettingsId } from '../models/Settings';

@injectable()
export class TimeHelper {
  constructor(
    @inject(Tokens.AdminDataSource)
    private adminDataSource: AdminDataSource
  ) {}

  // This function returns the start and end times of the current day in UTC of the timezone set in the app.
  // If you were in the UK at 6pm, then the day would end in 6 hours. For someome else who was in NZ
  // then their day would end in 18 hours (NZ is 12 hours ahead of UK so that is the next day).
  // This function returns the time in UTC format of the time the day starts and ends.
  // If you were in NZ time and used this function it would return noon (UTC) as the start and end times.
  // This function is necessary for handling actions that should finish at local midnight as the DB uses UTC.
  async getStartAndEndOfDayInUTC() {
    const timezone = await this.adminDataSource.getSetting(SettingsId.TIMEZONE);

    if (!timezone?.settingsValue) {
      throw new GraphQLError('No timezone found.');
    }

    if (!Info.isValidIANAZone(timezone.settingsValue)) {
      throw new GraphQLError(
        `Invalid timezone: "${timezone.settingsValue}" is not a recognized timezone.`
      );
    }

    const startOfTodayLocalInUTC = DateTime.now()
      .setZone(timezone.settingsValue)
      .startOf('day')
      .toUTC()
      .toJSDate();

    const endOfTodayLocalInUTC = DateTime.now()
      .setZone(timezone.settingsValue)
      .endOf('day')
      .toUTC()
      .toJSDate();

    return {
      startOfTodayLocalInUTC,
      endOfTodayLocalInUTC,
    };
  }
}
