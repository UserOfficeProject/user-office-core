import { injectable } from 'tsyringe';

import { BasicUserDetails } from '../../models/User';
import database from '../postgres/database';
import PostgresInstrumentDataSource from '../postgres/InstrumentDataSource';
import {
  InstitutionRecord,
  UserRecord,
  createBasicUserObject,
} from '../postgres/records';
import {
  StfcUserDataSource,
  toEssBasicUserDetails,
} from './StfcUserDataSource';

const stfcUserDataSource = new StfcUserDataSource();

@injectable()
export default class StfcInstrumentDataSource extends PostgresInstrumentDataSource {
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
      .then((usersRecord: Array<UserRecord & InstitutionRecord>) => {
        const users = usersRecord.map((user) => createBasicUserObject(user));

        return users;
      });

    const userNumbers = users.map((user) => user.id.toString());
    const stfcUsers =
      await stfcUserDataSource.getStfcBasicPeopleByUserNumbers(userNumbers);

    const usersDetails = stfcUsers
      ? stfcUsers.map((person) => toEssBasicUserDetails(person))
      : [];

    return usersDetails;
  }
}
