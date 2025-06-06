import { CoProposerClaim } from '../../models/CoProposerClaim';
import { CoProposerClaimDataSource } from '../CoProposerClaimDataSource';
import database from './database';
import { CoProposerClaimRecord } from './records';

export default class PostgresCoProposerClaimDataSource
  implements CoProposerClaimDataSource
{
  async findByProposalPk(proposalPk: number): Promise<CoProposerClaim[]> {
    return database('co_proposer_claims')
      .where({ proposal_pk: proposalPk })
      .select('*')
      .then((rows: CoProposerClaimRecord[]) => {
        return rows.map((row) => {
          return new CoProposerClaim(row.invite_id, row.proposal_pk);
        });
      });
  }
  async findByInviteId(inviteId: number): Promise<CoProposerClaim[]> {
    return database('co_proposer_claims')
      .where({ invite_id: inviteId })
      .select('*')
      .then((rows) =>
        rows.map((row) => new CoProposerClaim(row.invite_id, row.proposal_pk))
      );
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
