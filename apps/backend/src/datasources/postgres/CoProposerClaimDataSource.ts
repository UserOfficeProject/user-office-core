import { CoProposerClaim } from '../../models/CoProposerClaim';
import { CoProposerClaimDataSource } from '../CoProposerClaimDataSource';
import database from './database';
import { CoProposerClaimRecord } from './records';

export default class PostgresCoProposerClaimDataSource
  implements CoProposerClaimDataSource
{
  async getByProposalPk(proposalPk: number): Promise<CoProposerClaim[]> {
    return database('co_proposer_claims')
      .where({ proposal_pk: proposalPk })
      .select('*')
      .then((rows: CoProposerClaimRecord[]) => {
        return rows.map((row) => {
          return new CoProposerClaim(row.invite_id, row.proposal_pk);
        });
      });
  }
  async getByInviteId(inviteId: number): Promise<CoProposerClaim | null> {
    return database('co_proposer_claims')
      .where({ invite_code_id: inviteId })
      .select('*')
      .first()
      .then((row) => {
        if (!row) {
          return null;
        }

        return new CoProposerClaim(row.invite_code_id, row.proposal_pk);
      });
  }
  async create(inviteId: number, proposalPk: number): Promise<CoProposerClaim> {
    return database('co_proposer_claims')
      .insert({ invite_id: inviteId, proposal_pk: proposalPk })
      .returning('*')
      .then((rows) => {
        const row = rows[0];

        return new CoProposerClaim(row.invite_code_id, row.proposal_pk);
      });
  }
}
