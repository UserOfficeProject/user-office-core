import { DataAccessClaim } from '../../models/DataAccessClaim';
import { DataAccessClaimDataSource } from '../DataAccessClaimDataSource';

export class DataAccessClaimDataSourceMock
  implements DataAccessClaimDataSource
{
  private invites: DataAccessClaim[] = [];

  init() {
    this.invites = [
      new DataAccessClaim(1, 1),
      new DataAccessClaim(2, 2),
      new DataAccessClaim(3, 3),
    ];
  }

  async findByProposalPk(proposalPk: number): Promise<DataAccessClaim[]> {
    return this.invites.filter((invite) => invite.proposalPk === proposalPk);
  }

  async findByInviteId(inviteId: number): Promise<DataAccessClaim[]> {
    return this.invites.filter((invite) => invite.inviteId === inviteId);
  }

  async create(inviteId: number, proposalPk: number): Promise<DataAccessClaim> {
    const newInvite = new DataAccessClaim(inviteId, proposalPk);

    this.invites.push(newInvite);

    return newInvite;
  }
}
