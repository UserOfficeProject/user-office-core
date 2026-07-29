import { DataAccessClaim } from '../../models/DataAccessClaim';
import { DataAccessClaimDataSource } from '../DataAccessClaimDataSource';

export class DataAccessClaimDataSourceMock
  implements DataAccessClaimDataSource
{
  private invites: DataAccessClaim[] = [];

  init() {
    // Invite 4 in InviteDataSourceMock is the data access invite on proposal 1
    this.invites = [new DataAccessClaim(4, 1)];
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
