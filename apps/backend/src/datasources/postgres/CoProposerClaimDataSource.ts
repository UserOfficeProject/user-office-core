import { CoProposerClaim } from '../../models/CoProposerClaim';
import { CoProposerClaimDataSource } from '../CoProposerClaimDataSource';
import database from './database';

export default class PostgresCoProposerClaimDataSource
  implements CoProposerClaimDataSource
{
  async findByInviteId(inviteId: number): Promise<CoProposerClaim | null> {
    return database('co_proposer_claims')
      .where({ invite_id: inviteId })
      .select('*')
      .first()
      .then((row) => {
        if (!row) {
          return null;
        }

        return new CoProposerClaim(row.invite_id, row.proposal_pk);
      });
  }
  async create(inviteId: number, proposalPk: number): Promise<CoProposerClaim> {
    return database('co_proposer_claims')
      .insert({ invite_id: inviteId, proposal_pk: proposalPk })
      .returning('*')
      .then((rows) => {
        const row = rows[0];

        return new CoProposerClaim(row.invite_id, row.proposal_pk);
      });
  }
}
