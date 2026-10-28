import { DataAccessClaim } from '../../models/DataAccessClaim';
import { DataAccessClaimDataSource } from '../DataAccessClaimDataSource';
import database from './database';
import { createDataAccessClaimObject, DataAccessClaimRecord } from './records';

export default class PostgresDataAccessClaimDataSource
  implements DataAccessClaimDataSource
{
  async findByInviteId(inviteId: number): Promise<DataAccessClaim[]> {
    return database('data_access_claims')
      .where({ invite_id: inviteId })
      .select('*')
      .then((rows: DataAccessClaimRecord[]) => {
        if (!Array.isArray(rows)) {
          return [];
        }

        return rows.map(createDataAccessClaimObject);
      });
  }
  async create(inviteId: number, proposalPk: number): Promise<DataAccessClaim> {
    return database('data_access_claims')
      .insert({ invite_id: inviteId, proposal_pk: proposalPk })
      .returning('*')
      .then((rows: DataAccessClaimRecord[]) => {
        if (!Array.isArray(rows) || rows.length === 0) {
          throw new Error('Could not create data access claim');
        }

        return createDataAccessClaimObject(rows[0]);
      });
  }
}
