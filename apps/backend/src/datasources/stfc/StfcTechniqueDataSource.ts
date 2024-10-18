import { container, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
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

@injectable()
export default class StfcTechniqueDataSource extends PostgresTechniqueDataSource {
  protected stfcUserDataSource: StfcUserDataSource = container.resolve(
    Tokens.UserDataSource
  ) as StfcUserDataSource;
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
          return usersRecord.map((user) => createBasicUserObject(user));
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
