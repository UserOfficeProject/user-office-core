import { CoProposerInvite } from '../../models/CoProposerInvite';
import { CoProposerInviteDataSource } from '../CoProposerInviteDataSource';
import database from './database';

export default class PostgresCoProposerInviteDataSource
  implements CoProposerInviteDataSource
{
  async findByInviteCodeId(
    inviteCodeId: number
  ): Promise<CoProposerInvite | null> {
    return database('co_proposer_invites')
      .where({ invite_code_id: inviteCodeId })
      .select('*')
      .first()
      .then((row) => {
        if (!row) {
          return null;
        }

        return new CoProposerInvite(row.invite_code_id, row.proposal_pk);
      });
  }
  async create(
    inviteCodeId: number,
    proposalPk: number
  ): Promise<CoProposerInvite> {
    return database('co_proposer_invites')
      .insert({ invite_code_id: inviteCodeId, proposal_pk: proposalPk })
      .returning('*')
      .then((rows) => {
        const row = rows[0];

        return new CoProposerInvite(row.invite_code_id, row.proposal_pk);
      });
  }
}
