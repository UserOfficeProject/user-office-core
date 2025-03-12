import { RoleClaim } from '../../models/RoleClaim';
import { RoleClaimDataSource } from '../RoleClaimDataSource';

export class RoleClaimDataSourceMock implements RoleClaimDataSource {
  private roleClaims: RoleClaim[];

  constructor() {
    this.init();
  }

  public init() {
    this.roleClaims = [
      new RoleClaim(1, 101, 201),
      new RoleClaim(2, 102, 202),
      new RoleClaim(3, 103, 203),
    ];
  }

  async findByInviteId(inviteId: number): Promise<RoleClaim[]> {
    return this.roleClaims.filter(
      (roleClaim) => roleClaim.inviteId === inviteId
    );
  }

  async create(inviteId: number, roleId: number): Promise<RoleClaim> {
    const newRoleClaim = new RoleClaim(
      this.roleClaims.length + 1, // Generate new ID
      inviteId,
      roleId
    );

    this.roleClaims.push(newRoleClaim);

    return newRoleClaim;
  }

  async deleteByInviteId(inviteId: number): Promise<boolean> {
    const initialLength = this.roleClaims.length;
    this.roleClaims = this.roleClaims.filter(
      (roleClaim) => roleClaim.inviteId !== inviteId
    );

    return this.roleClaims.length < initialLength; // Return true if any records were removed
  }
}
