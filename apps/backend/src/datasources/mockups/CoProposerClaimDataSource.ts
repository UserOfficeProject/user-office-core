import { CoProposerClaim } from '../../models/CoProposerClaim';
import { CoProposerClaimDataSource } from '../CoProposerClaimDataSource';

export class CoProposerClaimDataSourceMock
  implements CoProposerClaimDataSource
{
  private invites: CoProposerClaim[] = [];

  init() {
    this.invites = [
      new CoProposerClaim(1, 1),
      new CoProposerClaim(2, 2),
      new CoProposerClaim(3, 3),
    ];
  }

  async findByInviteId(inviteId: number): Promise<CoProposerClaim | null> {
    return this.invites.find((invite) => invite.inviteId === inviteId) || null;
  }

  async create(inviteId: number, proposalPk: number): Promise<CoProposerClaim> {
    const newInvite = new CoProposerClaim(inviteId, proposalPk);

    this.invites.push(newInvite);

    return newInvite;
  }
}
