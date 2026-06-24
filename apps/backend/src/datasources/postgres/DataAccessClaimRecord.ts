import { DataAccessClaim } from '../../models/DataAccessClaim';
import { DataAccessClaimDataSource } from '../DataAccessClaimDataSource';
import database from './database';
import { DataAccessClaimRecord } from './records';

export default class PostgresDataAccessClaimDataSource
  implements DataAccessClaimDataSource
{
  // TODO: what should be the correct pk
  async findByProposalPk(proposalPk: number): Promise<DataAccessClaim[]> {
    // TODO: change to correct database
    return database('data_access_claims')
      .where({ proposal_pk: proposalPk })
      .select('*')
      .then((rows: DataAccessClaimRecord[]) => {
        return rows.map((row) => {
          return new DataAccessClaim(row.invite_id, row.proposal_pk);
        });
      });
  }
  async findByInviteId(inviteId: number): Promise<DataAccessClaim[]> {
    return database('data_access_claims')
      .where({ invite_id: inviteId })
      .select('*')
      .then((rows) =>
        rows.map((row) => new DataAccessClaim(row.invite_id, row.proposal_pk))
      );
  }
  async create(inviteId: number, proposalPk: number): Promise<DataAccessClaim> {
    return database('data_access_claims')
      .insert({ invite_id: inviteId, proposal_pk: proposalPk })
      .returning('*')
      .then((rows) => {
        const row = rows[0];

        return new DataAccessClaim(row.invite_id, row.proposal_pk);
      });
  }
}
