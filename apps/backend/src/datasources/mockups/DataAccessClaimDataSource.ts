import { DataAccessClaim } from '../../models/DataAccessClaim';
import { DataAccessClaimDataSource } from '../DataAccessClaimDataSource';

export class DataAccessClaimDataSourceMock
  implements DataAccessClaimDataSource
{
  private invites: DataAccessClaim[] = [];

  init() {
    this.invites = [
      new DataAccessClaim(7, 1), // use IDs unique from coproposal invites
      new DataAccessClaim(8, 2),
      new DataAccessClaim(9, 3),
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
