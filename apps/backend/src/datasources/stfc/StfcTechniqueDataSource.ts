import { injectable } from 'tsyringe';

import { BasicUserDetails } from '../../models/User';
import database from '../postgres/database';
import {
  CountryRecord,
  createBasicUserObject,
  InstitutionRecord,
  UserRecord,
} from '../postgres/records';
import PostgresTechniqueDataSource from '../postgres/TechniqueDataSource';
import {
  StfcUserDataSource,
  toEssBasicUserDetails,
} from './StfcUserDataSource';
const stfcUserDataSource = new StfcUserDataSource();
@injectable()
export default class StfcTechniqueDataSource extends PostgresTechniqueDataSource {
  async getTechniqueScientists(
    techniqueId: number
  ): Promise<BasicUserDetails[]> {
    const users = await database
      .select('*')
      .from('users as u')
      .join('technique_has_scientists as ths', {
        'u.user_id': 'ths.user_id',
      })
      .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .where('ths.technique_id', techniqueId)
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
      await stfcUserDataSource.getStfcBasicPeopleByUserNumbers(userNumbers);

    const usersDetails = stfcUsers
      ? stfcUsers.map((person) => toEssBasicUserDetails(person))
      : [];

    return usersDetails;
  }
}
