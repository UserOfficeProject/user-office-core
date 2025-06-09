import { injectable } from 'tsyringe';

import { VisitRegistrationClaim } from '../../models/VisitRegistrationClaim';
import { VisitRegistrationClaimDataSource } from '../VisitRegistrationClaimDataSource';

@injectable()
export class VisitRegistrationClaimDataSourceMock
  implements VisitRegistrationClaimDataSource
{
  private visitRegistrationClaims: VisitRegistrationClaim[];

  constructor() {
    this.init();
  }

  public init() {
    this.visitRegistrationClaims = [
      new VisitRegistrationClaim(1, 1),
      new VisitRegistrationClaim(2, 1),
      new VisitRegistrationClaim(3, 2),
      new VisitRegistrationClaim(1, 3),
    ];
  }

  async create(
    inviteId: number,
    visitId: number
  ): Promise<VisitRegistrationClaim> {
    const newClaim = new VisitRegistrationClaim(inviteId, visitId);
    this.visitRegistrationClaims.push(newClaim);

    return newClaim;
  }

  async findByInviteId(inviteId: number): Promise<VisitRegistrationClaim> {
    const claim = this.visitRegistrationClaims.find(
      (claim) => claim.inviteId === inviteId
    );

    if (!claim) {
      throw new Error(
        `VisitRegistrationClaim not found for inviteId: ${inviteId}`
      );
    }

    return claim;
  }

  async findByVisitId(visitId: number): Promise<VisitRegistrationClaim[]> {
    return this.visitRegistrationClaims.filter(
      (claim) => claim.visitId === visitId
    );
  }
}
