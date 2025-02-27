import { CoProposerInvite } from '../../models/CoProposerInvite';
import { CoProposerInviteDataSource } from '../CoProposerInviteDataSource';

export class CoProposerInviteDataSourceMock
  implements CoProposerInviteDataSource
{
  private invites: CoProposerInvite[] = [];

  init() {
    this.invites = [
      new CoProposerInvite(1, 1),
      new CoProposerInvite(2, 2),
      new CoProposerInvite(3, 3),
    ];
  }

  async findByInviteCodeId(
    inviteCodeId: number
  ): Promise<CoProposerInvite | null> {
    return (
      this.invites.find((invite) => invite.inviteCodeId === inviteCodeId) ||
      null
    );
  }

  async create(
    inviteCodeId: number,
    proposalPk: number
  ): Promise<CoProposerInvite> {
    const newInvite = new CoProposerInvite(inviteCodeId, proposalPk);

    this.invites.push(newInvite);

    return newInvite;
  }
}
