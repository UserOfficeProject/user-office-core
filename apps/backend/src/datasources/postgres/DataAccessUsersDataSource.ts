import { Rejection } from '../../models/Rejection';
import { BasicUserDetails } from '../../models/User';
import { DataAccessUsersDataSource } from '../DataAccessUsersDataSource';
import database from './database';
import {
  CountryRecord,
  InstitutionRecord,
  UserRecord,
  createBasicUserObject,
} from './records';

export default class PostgresDataAccessUsersDataSource
  implements DataAccessUsersDataSource
{
  async findByProposalPk(proposalPk: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users as u')
      .join('institutions as i', { 'u.institution_id': 'i.institution_id' })
      .join('countries as c', { 'i.country_id': 'c.country_id' })
      .join('data_access_user_has_proposal as dauhp', {
        'u.user_id': 'dauhp.user_id',
      })
      .where('dauhp.proposal_pk', proposalPk)
      .then((users: Array<UserRecord & InstitutionRecord & CountryRecord>) =>
        users.map((user) => createBasicUserObject(user))
      );
  }

  async updateDataAccessUsers(
    proposalPk: number,
    userIds: number[]
  ): Promise<BasicUserDetails[] | Rejection> {
    try {
      // Start a transaction
      await database.transaction(async (trx) => {
        // Delete existing entries for this proposal
        await trx('data_access_user_has_proposal')
          .where('proposal_pk', proposalPk)
          .del();

        // Insert new entries if userIds is not empty
        if (userIds.length > 0) {
          const insertData = userIds.map((userId) => ({
            proposal_pk: proposalPk,
            user_id: userId,
          }));

          await trx('data_access_user_has_proposal').insert(insertData);
        }
      });

      // Return updated list of users
      return this.findByProposalPk(proposalPk);
    } catch (error) {
      return new Rejection('Failed to update data access users', {
        proposalPk,
        userIds,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
