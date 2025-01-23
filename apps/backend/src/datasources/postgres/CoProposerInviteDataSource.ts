import { CoProposerInvite } from '../../models/CoProposerInvite';
import { CoProposerInviteDataSource } from '../CoProposerInviteDataSource';
import database from './database';

export default class PostgresCoProposerInviteDataSource
  implements CoProposerInviteDataSource
{
  async findByProposalPk(proposalPk: number): Promise<CoProposerInvite[]> {
    return database('co_proposer_invites')
      .where({ proposal_pk: proposalPk })
      .select('*')
      .then((rows) => {
        return rows.map(
          (row) =>
            new CoProposerInvite(
              row.co_proposer_invite_id,
              row.invite_code_id,
              row.proposal_pk
            )
        );
      });
  }
  async findByInviteCodeId(inviteCodeId: number): Promise<CoProposerInvite[]> {
    return database('co_proposer_invites')
      .where({ invite_code_id: inviteCodeId })
      .select('*')
      .then((rows) => {
        return rows.map(
          (row) =>
            new CoProposerInvite(
              row.co_proposer_invite_id,
              row.invite_code_id,
              row.proposal_pk
            )
        );
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

        return new CoProposerInvite(
          row.co_proposer_invite_id,
          row.invite_code_id,
          row.proposal_pk
        );
      });
  }
}
