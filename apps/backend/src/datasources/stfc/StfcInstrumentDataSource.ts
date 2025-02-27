import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { BasicUserDetails } from '../../models/User';
import database from '../postgres/database';
import PostgresInstrumentDataSource from '../postgres/InstrumentDataSource';
import {
  CountryRecord,
  InstitutionRecord,
  UserRecord,
  createBasicUserObject,
} from '../postgres/records';
import {
  StfcUserDataSource,
  toEssBasicUserDetails,
} from './StfcUserDataSource';

@injectable()
export default class StfcInstrumentDataSource extends PostgresInstrumentDataSource {
  protected stfcUserDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;

  async getInstrumentScientists(
    instrumentId: number
  ): Promise<BasicUserDetails[]> {
    const users = await database
      .select('*')
      .from('users as u')
      .join('instrument_has_scientists as ihs', {
        'u.user_id': 'ihs.user_id',
      })
      .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .where('ihs.instrument_id', instrumentId)
      .then(
        (
          usersRecord: Array<UserRecord & InstitutionRecord & CountryRecord>
        ) => {
          const users = usersRecord.map((user) => createBasicUserObject(user));

          return users;
        }
      );

    const userNumbers = users.map((user) => user.id.toString());
    const stfcUsers =
      await this.stfcUserDataSource.getStfcBasicPeopleByUserNumbers(
        userNumbers
      );

    const usersDetails = stfcUsers
      ? stfcUsers.map((person) => toEssBasicUserDetails(person))
      : [];

    return usersDetails;
  }
}
