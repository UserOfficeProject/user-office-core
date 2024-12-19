import { RoleInvite } from '../../models/RoleInvite';
import { RoleInviteDataSource } from '../RoleInviteDataSource';

export class RoleInviteDataSourceMock implements RoleInviteDataSource {
  private roleInvites: RoleInvite[];

  constructor() {
    this.init();
  }

  public init() {
    this.roleInvites = [
      new RoleInvite(1, 101, 201),
      new RoleInvite(2, 102, 202),
      new RoleInvite(3, 103, 203),
    ];
  }

  async findByInviteCodeId(inviteCodeId: number): Promise<RoleInvite[]> {
    return this.roleInvites.filter(
      (roleInvite) => roleInvite.inviteCodeId === inviteCodeId
    );
  }

  async create(inviteCodeId: number, roleId: number): Promise<RoleInvite> {
    const newRoleInvite = new RoleInvite(
      this.roleInvites.length + 1, // Generate new ID
      inviteCodeId,
      roleId
    );

    this.roleInvites.push(newRoleInvite);

    return newRoleInvite;
  }

  async deleteByInviteCodeId(inviteCodeId: number): Promise<boolean> {
    const initialLength = this.roleInvites.length;
    this.roleInvites = this.roleInvites.filter(
      (roleInvite) => roleInvite.inviteCodeId !== inviteCodeId
    );

    return this.roleInvites.length < initialLength; // Return true if any records were removed
  }
}
